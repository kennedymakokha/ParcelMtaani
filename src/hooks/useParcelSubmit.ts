// hooks/useParcelSubmit.ts

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import { useRegisterParcelMutation } from '../services/apis/parcel.api';
import {
  useCreatepaymentMutation,
  useMpesapayMutation,
} from '../services/apis/mpesa.api.ts';

import { buildReceiptText } from '../services /recieptBuilder.tsx';
import { printToPrinter } from '../services /printer.service.ts';

/**
 * =========================
 * SIMPLE QR ENCRYPTION (NO LIBS)
 * =========================
 */

const XOR_KEY = 'qr-xor-key';

const base64Encode = (str: string) =>
  Buffer.from(str, 'utf8').toString('base64');

const base64Decode = (str: string) =>
  Buffer.from(str, 'base64').toString('utf8');

const xorTransform = (text: string) => {
  return text
    .split('')
    .map(
      (c, i) =>
        String.fromCharCode(
          c.charCodeAt(0) ^
          XOR_KEY.charCodeAt(i % XOR_KEY.length),
        ),
    )
    .join('');
};

const encryptQR = (payload: any) => {
  const json = JSON.stringify(payload);
  return base64Encode(xorTransform(json));
};

const simpleHash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
};

const signQR = (code: string, id: string) =>
  simpleHash(`${code}:${id}:${XOR_KEY}`);

/**
 * =========================
 * TYPES
 * =========================
 */

interface SubmitParcelParams {
  formData: any;
  paymentMethod: 'CASH' | 'MPESA';
  isSplitPayment: boolean;
  phoneNumber: string;
  amountGiven: string;
  mpesaPortion: string;
  parcelTotal: number;
  business: any,
  pickup: string;
  pickups: any[];
  user: any;
  selectedPrinterMac: string;
  refetch: () => Promise<void>;
  onSuccess?: (data: any) => void;
}

const PRINT_QUEUE_KEY = 'pending_print_jobs';

export const useParcelSubmit = () => {
  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });

  const [postParcel] = useRegisterParcelMutation();
  const [lipaNaMpesa] = useMpesapayMutation();
  const [createPayment] = useCreatepaymentMutation();

  /**
   * =========================
   * SAVE PRINT JOB
   * =========================
   */
  const saveJob = async (job: any) => {
    const existing = await AsyncStorage.getItem(PRINT_QUEUE_KEY);
    const jobs = existing ? JSON.parse(existing) : [];
    jobs.push(job);
    await AsyncStorage.setItem(
      PRINT_QUEUE_KEY,
      JSON.stringify(jobs),
    );
  };

  const removeJob = async (id: string) => {
    const existing = await AsyncStorage.getItem(PRINT_QUEUE_KEY);
    const jobs = existing ? JSON.parse(existing) : [];
    const updated = jobs.filter((j: any) => j.id !== id);
    await AsyncStorage.setItem(
      PRINT_QUEUE_KEY,
      JSON.stringify(updated),
    );
  };

  /**
   * =========================
   * MAIN FUNCTION
   * =========================
   */
  const submitParcel = async ({
    formData,
    paymentMethod,
    isSplitPayment,
    phoneNumber,
    amountGiven,
    mpesaPortion,
    parcelTotal,
    pickup,
    pickups,
    business,
    user,
    selectedPrinterMac,
    refetch,
    onSuccess,
  }: SubmitParcelParams) => {
    try {
      const currentPickup = pickups.find(
        (p: any) => p._id === pickup,
      );

      let mpesaResponse: any = null;

      /**
       * 1. BUILD PAYLOAD
       */
      const updatedFormData = {
        ...formData,
        print_status: 'PENDING',
        qr_status: 'READY',
        payment: {
          method: isSplitPayment ? 'SPLIT' : paymentMethod,
          cash:
            paymentMethod === 'CASH'
              ? parcelTotal
              : Number(amountGiven || 0),
          mpesa:
            paymentMethod === 'MPESA'
              ? parcelTotal
              : Number(mpesaPortion || 0),
          phone: phoneNumber,
          mpesaData: null,
        },
        parcel: {
          ...formData.parcel,
          pickup,
        },
      };

      /**
       * 2. MPESA (DO NOT BLOCK PARCEL SAVE IF IT FAILS HARD)
       */
      try {
        if (paymentMethod === 'MPESA' || isSplitPayment) {
          mpesaResponse = await lipaNaMpesa({
            phone_number: phoneNumber,
            amount:
              paymentMethod === 'MPESA'
                ? parcelTotal
                : Number(mpesaPortion || 0),
            pickup_id: user.pickup?._id,
          }).unwrap();

          updatedFormData.payment.mpesaData = mpesaResponse;
        }
      } catch (mpesaErr) {
        console.log('MPESA failed:', mpesaErr);
      }

      /**
       * 3. SAVE PARCEL (ALWAYS CONTINUES)
       */
      const response = await postParcel(updatedFormData).unwrap();
      const savedParcel = response?.parcel || response;

      const parcelCode =
        savedParcel?.parcel?.code || savedParcel?.code;

      const receiptNo = parcelCode;

      /**
       * 4. SAVE PAYMENT
       */
      const payments: any[] = [];

      if (paymentMethod === 'CASH') {
        payments.push({
          method: 'CASH',
          amount: parcelTotal,
        });
      }

      if (paymentMethod === 'MPESA' && mpesaResponse) {
        payments.push({
          method: 'MPESA',
          amount: parcelTotal,
          phone: phoneNumber,
          receiptNumber:
            mpesaResponse?.MpesaReceiptNumber || '',
        });
      }

      await createPayment({
        parcel: savedParcel?._id,
        pickup: currentPickup._id,
        payments,
        receiptNo,
      }).unwrap();

      /**
       * 5. QR ENCRYPTION (SAFE)
       */
      const qrPayload = {
        code: parcelCode, // MUST stay plain
        data: encryptQR({
          id: receiptNo,
          receiver: formData.receiver.phone,
          receivername: formData.receiver.name,
          pickupName: currentPickup?.pickup_name,
          from: user?.pickup?.pickup_name || '',
        }),
        signature: signQR(parcelCode, receiptNo),
      };

      const qrData = JSON.stringify(qrPayload);

      /**
       * 6. PRINT
       */
      const receiptText = buildReceiptText({
        receiptNo,
        sender: formData.sender,
        reciever: formData.receiver,
        parcel: savedParcel?.parcel,
        method: paymentMethod,
        paid: parcelTotal,
        phoneNumber,
        business
      });

      const job = {
        id: `${Date.now()}`,
        parcelId: savedParcel?._id,
        receiptText,
        qrData,
        status: 'PENDING',
      };

      await saveJob(job);

      let printed = false;
      let attempts = 0;

      while (!printed && attempts < 10) {
        attempts++;

        try {
          printed = await printToPrinter(
            selectedPrinterMac,
            receiptText,
          );

          if (!printed) throw new Error('print failed');

          await removeJob(job.id);
        } catch (e: any) {
          console.log(e);
          setMsg({
            msg: 'Printer not ready, retrying...',
            state: 'warning',
          });

          await new Promise((r: any) => setTimeout(r, 3000));
        }
      }

      /**
       * 7. SUCCESS
       */
      await refetch();

      setMsg({
        msg: 'Parcel completed successfully',
        state: 'success',
      });

      onSuccess?.({ qrData, parcelCode, savedParcel });

      return { success: true, qrData, parcelCode };
    } catch (error: any) {
      setMsg({
        msg: error?.message || 'Error occurred',
        state: 'error',
      });

      return { success: false };
    }
  };

  return {
    submitParcel,
    msg,
    setMsg,
  };
};
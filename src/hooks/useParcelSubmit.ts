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
import { normalizePhoneNumber } from '../utils/trancateText.ts';
import { useSelector } from 'react-redux';

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
console.log(base64Decode('gh'));
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
export let loading = false
export const useParcelSubmit = () => {
  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const [postParcel, { isLoading: loadingParcel }] = useRegisterParcelMutation();
  const [lipaNaMpesa] = useMpesapayMutation();
  const [createPayment, { isLoading }] = useCreatepaymentMutation();
  loading = isLoading || loadingParcel
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
    business,
    user,
    selectedPrinterMac,
    refetch,
    onSuccess,
  }: SubmitParcelParams) => {

    try {


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

          cash: isSplitPayment
            ? Number(amountGiven || 0)
            : paymentMethod === 'CASH'
              ? parcelTotal
              : 0,

          mpesa: isSplitPayment
            ? Number(mpesaPortion || 0)
            : paymentMethod === 'MPESA'
              ? parcelTotal
              : 0,
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
            phone_number: normalizePhoneNumber(phoneNumber),
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
      console.log("RESPONSE", mpesaResponse);
      const parcelCode =
        savedParcel?.parcel?.code || savedParcel?.code;

      const receiptNo = parcelCode;

      /**
       * 4. SAVE PAYMENT
       */
      const payments: any[] = [];
      console.log("PAYMENR", payments);
      /**
       * SPLIT PAYMENT
       */
      if (isSplitPayment) {
        const cashAmount = Number(amountGiven || 0);
        const mpesaAmount = Number(mpesaPortion || 0);

        if (cashAmount > 0) {
          payments.push({
            method: 'CASH',
            amount: cashAmount,
          });
        }

        if (mpesaAmount > 0) {
          payments.push({
            method: 'MPESA',
            amount: mpesaAmount,
            phone: phoneNumber,
            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber || '',
          });
        }
      }

      /**
       * FULL CASH
       */
      else if (paymentMethod === 'CASH') {
        payments.push({
          method: 'CASH',
          amount: parcelTotal,
        });
      }

      /**
       * FULL MPESA
       */
      // else if (
      //   paymentMethod === 'MPESA' &&
      //   mpesaResponse
      // ) {
      //   payments.push({
      //     method: 'MPESA',
      //     amount: parcelTotal,
      //     phone: phoneNumber,
      //     receiptNumber:
      //       mpesaResponse?.MpesaReceiptNumber || '',
      //   });
      // }
      else if (paymentMethod === 'MPESA') {
        payments.push({
          method: 'MPESA',
          amount: parcelTotal,
          phone: phoneNumber,
          receiptNumber:
            mpesaResponse?.MpesaReceiptNumber || '',
          status: mpesaResponse ? 'SUCCESS' : 'PENDING',
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
      console.log(error);
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
// hooks/useParcelSubmit.ts

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterParcelMutation } from '../services/apis/parcel.api';
import {
  useCreatepaymentMutation,
  useMpesapayMutation,
} from '../services/apis/mpesa.api.ts';

import { buildReceiptText } from '../services /recieptBuilder.tsx';
import { printToPrinter } from '../services /printer.service.ts';

interface SubmitParcelParams {
  formData: any;
  paymentMethod: 'CASH' | 'MPESA';
  isSplitPayment: boolean;
  phoneNumber: string;
  amountGiven: string;
  mpesaPortion: string;
  parcelTotal: number;
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

  const [postParcel, { isLoading: submitting }] =
    useRegisterParcelMutation();

  const [lipaNaMpesa, { isLoading: paying }] =
    useMpesapayMutation();

  const [createPayment] =
    useCreatepaymentMutation();

  const isProcessing = submitting || paying;

  /**
   * =========================
   * SAVE PRINT JOB
   * =========================
   */

  const savePendingPrintJob = async (
    printJob: any,
  ) => {
    try {
      const existing =
        await AsyncStorage.getItem(
          PRINT_QUEUE_KEY,
        );

      const jobs = existing
        ? JSON.parse(existing)
        : [];

      const alreadyExists = jobs.find(
        (j: any) => j.id === printJob.id,
      );

      if (!alreadyExists) {
        jobs.push(printJob);

        await AsyncStorage.setItem(
          PRINT_QUEUE_KEY,
          JSON.stringify(jobs),
        );
      }
    } catch (err) {
      console.log(
        'Failed to save print job',
        err,
      );
    }
  };

  /**
   * =========================
   * REMOVE PRINT JOB
   * =========================
   */

  const removePendingPrintJob = async (
    id: string,
  ) => {
    try {
      const existing =
        await AsyncStorage.getItem(
          PRINT_QUEUE_KEY,
        );

      const jobs = existing
        ? JSON.parse(existing)
        : [];

      const updated = jobs.filter(
        (j: any) => j.id !== id,
      );

      await AsyncStorage.setItem(
        PRINT_QUEUE_KEY,
        JSON.stringify(updated),
      );
    } catch (err) {
      console.log(
        'Failed to remove print job',
        err,
      );
    }
  };

  /**
   * =========================
   * SUBMIT PARCEL
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
    user,
    selectedPrinterMac,
    refetch,
    onSuccess,
  }: SubmitParcelParams) => {
    try {
      const currentPickup = pickups.find(
        (p: any) => p._id === pickup,
      );

      const pickupFullName =
        currentPickup?.pickup_name || '';

      let mpesaResponse: any = null;

      /**
       * =========================
       * BUILD PAYLOAD
       * =========================
       */

      const updatedFormData = {
        ...formData,

        print_status: 'PENDING',

        payment: {
          method: isSplitPayment
            ? 'SPLIT'
            : paymentMethod,

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
      updatedFormData.print_status =
        'PENDING';

      updatedFormData.qr_status =
        'READY';
      /**
       * =========================
       * MPESA PAYMENT
       * =========================
       */

      if (
        paymentMethod === 'MPESA' ||
        isSplitPayment
      ) {
        mpesaResponse = await lipaNaMpesa({
          phone_number: phoneNumber,

          amount:
            paymentMethod === 'MPESA'
              ? parcelTotal
              : Number(mpesaPortion || 0),

          pickup_id: user.pickup?._id,
        }).unwrap();

        updatedFormData.payment.mpesaData =
          mpesaResponse;

        if (
          !mpesaResponse ||
          mpesaResponse.ResponseCode !== 0
        ) {
          throw new Error(
            mpesaResponse?.message ||
            'Mpesa payment failed',
          );
        }
      }

      /**
       * =========================
       * SAVE PARCEL
       * =========================
       */

      const response = await postParcel(
        updatedFormData,
      ).unwrap();

      const savedParcel =
        response?.parcel || response;

      /**
       * =========================
       * BUILD PAYMENTS
       * =========================
       */

      const payments = [];

      if (isSplitPayment) {
        if (Number(amountGiven) > 0) {
          payments.push({
            method: 'CASH',
            amount: Number(amountGiven),
          });
        }

        if (Number(mpesaPortion) > 0) {
          payments.push({
            method: 'MPESA',
            amount: Number(mpesaPortion),
            phone: phoneNumber,
            customer_name:
              formData?.sender?.name ||
              'Unknown Customer',
            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber ||
              '',
          });
        }
      } else {
        if (paymentMethod === 'CASH') {
          payments.push({
            method: 'CASH',
            amount: Number(parcelTotal),
          });
        }

        if (paymentMethod === 'MPESA') {
          payments.push({
            method: 'MPESA',
            amount: Number(parcelTotal),
            phone: phoneNumber,
            customer_name:
              formData?.sender?.name ||
              'Unknown Customer',
            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber ||
              '',
          });
        }
      }

      /**
       * =========================
       * CREATE PAYMENT
       * =========================
       */

      const parcelCode =
        savedParcel?.parcel?.code ||
        savedParcel?.code;

      const receiptNo = `${parcelCode}`;

      await createPayment({
        parcel: savedParcel?._id,
        pickup: currentPickup._id,
        payments,
        receiptNo,
      }).unwrap();

      /**
       * =========================
       * BUILD RECEIPT
       * =========================
       */

      const receiptText = buildReceiptText({
        receiptNo,

        invoiceId: receiptNo,

        sender: formData.sender,

        reciever: formData.receiver,

        parcel: {
          ...savedParcel?.parcel,
          code: parcelCode,
        },

        method: isSplitPayment
          ? 'SPLIT'
          : paymentMethod,

        paid: parcelTotal,

        paidCash:
          paymentMethod === 'CASH'
            ? parcelTotal
            : Number(amountGiven || 0),

        paidMpesa:
          paymentMethod === 'MPESA'
            ? parcelTotal
            : Number(mpesaPortion || 0),

        mpesaData: {
          receiptNumber:
            mpesaResponse?.MpesaReceiptNumber,

          transactionDate: new Date(),

          phoneNumber:
            mpesaResponse?.phone_number ||
            phoneNumber,
        },

        phoneNumber,

        totals: {
          finalTotal: parcelTotal,
        },

        from: `${user?.pickup?.pickup_name || ''}`,

        pickupName: pickupFullName,

        user: {
          name: user?.name || 'Admin',
        },

        business: user.business,
      });

      /**
       * =========================
       * QR DATA
       * =========================
       */

      /**
  * =========================
  * QR DATA
  * =========================
  */

      const qrPayload = {
        id: receiptNo,

        parcelId: savedParcel?._id,

        parcelCode,

        sender: formData.sender,

        receiver: formData.receiver,

        pickupName: pickupFullName,

        from: `${user?.pickup?.pickup_name || ''}`,

        amount: parcelTotal,

        paymentMethod: isSplitPayment
          ? 'SPLIT'
          : paymentMethod,

        createdAt: new Date().toISOString(),
      };

      const qrData = JSON.stringify(qrPayload);
      /**
       * =========================
       * PRINT JOB
       * =========================
       */

      const printJob = {
        id: `${Date.now()}`,

        parcelId: savedParcel?._id,

        printerMac: selectedPrinterMac,

        receiptText,

        qrData,

        qrPayload,

        print_status: 'PENDING',

        qr_status: 'READY',

        createdAt:
          new Date().toISOString(),
      };

      /**
       * =========================
       * SAVE JOB FIRST
       * =========================
       */

      await savePendingPrintJob(printJob);

      /**
       * =========================
       * KEEP RETRYING UNTIL SUCCESS
       * =========================
       */

      let printed = false;

      while (!printed) {
        try {
          printed = await printToPrinter(
            selectedPrinterMac,
            receiptText,
          );

          if (!printed) {
            throw new Error(
              'Printer returned false',
            );
          }

          /**
           * =========================
           * UPDATE STATUS
           * =========================
           */

        
          savedParcel.print_status =
            'PRINTED';

          savedParcel.qr_status =
            'PRINTED';
          /**
           * =========================
           * REMOVE FROM QUEUE
           * =========================
           */

          await removePendingPrintJob(
            printJob.id,
          );

          console.log(
            'Receipt printed successfully',
          );
        } catch (printErr) {
          console.log(
            'Print failed. Retrying...',
            printErr,
          );

          savedParcel.print_status =
            'PENDING';

          setMsg({
            msg:
              'Waiting for printer connection...',
            state: 'warning',
          });

          await new Promise((resolve: any) =>
            setTimeout(resolve, 3000),
          );
        }
      }

      /**
       * =========================
       * SUCCESS
       * =========================
       */

      await refetch();

      setMsg({
        msg:
          'Parcel registered and receipt printed successfully',
        state: 'success',
      });

      onSuccess?.({
        qrData,
        parcelCode,
        savedParcel,
        print_status: 'PRINTED',
      });

      return {
        success: true,
        qrData,
        parcelCode,
        print_status: 'PRINTED',
      };
    } catch (error: any) {
      console.log(error);

      setMsg({
        msg:
          error?.data?.message ||
          error?.message ||
          'An unknown error occurred',

        state: 'error',
      });

      return {
        success: false,
      };
    }
  };

  return {
    submitParcel,
    msg,
    setMsg,
    isProcessing,
  };
};
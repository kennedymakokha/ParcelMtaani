// hooks/useParcelSubmit.ts

import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRegisterParcelMutation } from '../services/apis/parcel.api';
import { useCreatepaymentMutation, useMpesapayMutation } from '../services/apis/mpesa.api.ts';
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

export const useParcelSubmit = () => {
  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });

  const [postParcel, { isLoading: submitting }] =
    useRegisterParcelMutation();

  const [lipaNaMpesa, { isLoading: paying }] =
    useMpesapayMutation();
  const [createPayment] = useCreatepaymentMutation()
  const isProcessing = submitting || paying;

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

      const pickupShortCode =
        currentPickup?.short_code || '';

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

      /**
       * =========================
       * MPESA
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
* SAVE PAYMENTS
* =========================
*/

      const payments = [];

      /**
       * SPLIT PAYMENT
       */

      if (isSplitPayment) {

        // CASH
        if (Number(amountGiven) > 0) {
          payments.push({
            method: 'CASH',

            amount: Number(amountGiven),
          });
        }

        // MPESA
        if (Number(mpesaPortion) > 0) {
          payments.push({
            method: 'MPESA',

            amount: Number(mpesaPortion),

            phone: phoneNumber,

            customer_name:
              formData?.sender?.name ||
              'Unknown Customer',

            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber || '',
          });
        }

      } else {

        /**
         * CASH ONLY
         */

        if (paymentMethod === 'CASH') {
          payments.push({
            method: 'CASH',

            amount: Number(parcelTotal),
          });
        }

        /**
         * MPESA ONLY
         */

        if (paymentMethod === 'MPESA') {
          payments.push({
            method: 'MPESA',

            amount: Number(parcelTotal),

            phone: phoneNumber,

            customer_name:
              formData?.sender?.name ||
              'Unknown Customer',

            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber || '',
          });
        }
      }

      /**
       * POST PAYMENTS
       */

      const parcelCode =
        savedParcel?.parcel?.code ||
        savedParcel?.code;

      /**
       * =========================
       * RECEIPT
       * =========================
       */

      const receiptNo = `${parcelCode}`;
      await createPayment({
        parcel: savedParcel?._id,
        pickup: currentPickup._id,
        payments,
        receiptNo,
      }).unwrap();


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

      const qrData = JSON.stringify({
        id: receiptNo,

        reciever: formData.receiver,

        pickupName: pickupFullName,

        code: parcelCode,

        from: `${user?.pickup?.pickup_name || ''}`,
      });

      /**
       * =========================
       * PRINT
       * =========================
       */

      let printed = false;

      let attempts = 0;

      const MAX_RETRIES = 5;

      while (
        !printed &&
        attempts < MAX_RETRIES
      ) {
        attempts++;

        try {
          printed = await printToPrinter(
            selectedPrinterMac,
            receiptText,
          );

          if (!printed) {
            throw new Error('Printing failed');
          }
        } catch (printErr) {
          console.log(
            `Print attempt ${attempts} failed`,
            printErr,
          );

          if (attempts >= MAX_RETRIES) {
            /**
             * =========================
             * SAVE FAILED PRINT
             * =========================
             */

            try {
              const storedPrints =
                await AsyncStorage.getItem(
                  'failed_prints',
                );

              const failedPrints = storedPrints
                ? JSON.parse(storedPrints)
                : [];

              failedPrints.push({
                parcelId: savedParcel?._id,

                receiptText,

                qrData,

                code: parcelCode,

                receiptNo,

                pickupShortCode,

                printerMac:
                  selectedPrinterMac,

                createdAt:
                  new Date().toISOString(),
              });

              await AsyncStorage.setItem(
                'failed_prints',
                JSON.stringify(failedPrints),
              );
            } catch (storageError) {
              console.log(
                'Failed to save failed print locally',
                storageError,
              );
            }

            setMsg({
              msg: 'Parcel saved but printing failed',

              state: 'warning',
            });

            return;
          }

          await new Promise((resolve: any) =>
            setTimeout(resolve, 2000),
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
      });

      return {
        success: true,
        qrData,
        parcelCode,
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
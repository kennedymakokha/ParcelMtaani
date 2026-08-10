import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';



import {
  normalizePhoneNumber,
} from '../../../utils/trancateText';

import {
  encryptQR,
  signQR,
} from '../../../hooks/useParcelSubmit';

import {
  buildTicketReceipt,
} from '../services/ticketReceiptBuilder';
import { useCreateTicketMutation } from '../../../services/apis/ticket.api';
import { useCreatepaymentMutation, useMpesapayMutation } from '../../../services/apis/mpesa.api.ts';
import { printToPrinter } from '../../../service/printer.service.ts';




const PRINT_QUEUE_KEY = 'pending_ticket_jobs';

export let loading = false;

interface SubmitTicketParams {
  passenger: any;

  journey: any;

  seat: any;

  luggage: number;

  paymentMethod: 'Cash' | 'Mpesa' | 'Card';

  phoneNumber: string;

  selectedPrinterMac: string;

  business: any;

  user: any;

  printTicket: boolean;

  printQr: boolean;

  refetch: () => Promise<void>;

  onSuccess?: (ticket: any) => void;
}

export const useTicketSubmit = () => {
  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });

  const [
    createTicket,
    { isLoading: creatingTicket },
  ] = useCreateTicketMutation();

  const [
    createPayment,
    { isLoading: creatingPayment },
  ] = useCreatepaymentMutation();

  const [
    lipaNaMpesa,
    { isLoading: mpesaLoading },
  ] = useMpesapayMutation();

  loading =
    creatingTicket ||
    creatingPayment ||
    mpesaLoading;

  /**
   * -----------------------
   * Save pending print job
   * -----------------------
   */

  const saveJob = async (job: any) => {
    const existing =
      await AsyncStorage.getItem(
        PRINT_QUEUE_KEY,
      );

    const jobs = existing
      ? JSON.parse(existing)
      : [];

    jobs.push(job);

    await AsyncStorage.setItem(
      PRINT_QUEUE_KEY,
      JSON.stringify(jobs),
    );
  };

  /**
   * -----------------------
   * Remove completed job
   * -----------------------
   */

  const removeJob = async (
    id: string,
  ) => {
    const existing =
      await AsyncStorage.getItem(
        PRINT_QUEUE_KEY,
      );

    const jobs = existing
      ? JSON.parse(existing)
      : [];

    const updated =
      jobs.filter(
        (j: any) => j.id !== id,
      );

    await AsyncStorage.setItem(
      PRINT_QUEUE_KEY,
      JSON.stringify(updated),
    );
  };

  /**
   * =============================
   * Submit Ticket
   * =============================
   */

  const submitTicket = async ({
    passenger,
    journey,
    seat,
    luggage,
    paymentMethod,
    phoneNumber,
    selectedPrinterMac,
    business,
    user,
    printTicket,
    printQr,
    refetch,
    onSuccess,
  }: SubmitTicketParams) => {
    try {
      let mpesaResponse: any = null;

      /**
       * ----------------------------------
       * 1. MPESA PAYMENT
       * ----------------------------------
       */

      if (paymentMethod === 'Mpesa') {
        mpesaResponse =
          await lipaNaMpesa({
            phone_number:
              normalizePhoneNumber(
                phoneNumber,
              ),

            amount: Number(
              journey.fare,
            ),

            pickup_id:
              user.pickup._id,
          }).unwrap();
      }

      /**
       * ----------------------------------
       * 2. CREATE TICKET
       * ----------------------------------
       */

      const response =
        await createTicket({
          passenger,

          journey,

          seat: seat.seatNo,

          luggage,

          paymentMethod,

          mpesa: mpesaResponse,
        }).unwrap();

      const ticket =
        response.ticket;

      /**
       * ----------------------------------
       * 3. CREATE PAYMENT
       * ----------------------------------
       */

      await createPayment({
        ticket: ticket._id,

        receiptNo:
          ticket.ticketNumber,

        payments: [
          {
            method:
              paymentMethod.toUpperCase(),

            amount: Number(
              journey.fare,
            ),

            phone: phoneNumber,

            receiptNumber:
              mpesaResponse?.MpesaReceiptNumber ||
              '',
          },
        ],
      }).unwrap();

      /**
       * ----------------------------------
       * 4. QR PAYLOAD
       * ----------------------------------
       */

      const qrPayload =
        JSON.stringify({
          code:
            ticket.ticketNumber,

          data: encryptQR({
            ticket:
              ticket.ticketNumber,

            passenger:
              passenger.fullName,

            phone:
              passenger.phone,

            seat:
              seat.seatNo,

            route:
              `${journey.from}-${journey.destination}`,

            trip:
              journey.trip,
          }),

          signature:
            signQR(
              ticket.ticketNumber,
              ticket._id,
            ),
        });
      
      /**
       * ----------------------------------
       * 5. PAYMENT OBJECT
       * ----------------------------------
       */

      const payment = {
        method:
          paymentMethod,

        amount:
          Number(
            journey.fare,
          ),

        receiptNumber:
          mpesaResponse?.MpesaReceiptNumber ||
          '',
      };

      /**
       * ----------------------------------
       * 6. BUILD RECEIPT
       * ----------------------------------
       */

      const receipt =
        buildTicketReceipt({
          ticket,

          passenger,

          journey,

          seat,

          payment,

          business,

          luggage,
        });
        console.log("receipt",selectedPrinterMac, receipt);
       await printToPrinter(selectedPrinterMac, receipt);
        console.log("receipt",selectedPrinterMac, receipt);
      /**
       * ----------------------------------
       * 7. BUILD BAG TAG
       * ----------------------------------
       */

      // const bagTag =
      //   buildBagTag({
      //     ticket,

      //     passenger,

      //     journey,

      //     seat,

      //     luggage,
      //   });

      /**
       * ----------------------------------
       * 8. SAVE PRINT JOB
       * ----------------------------------
       */

      // const job = {
      //   id: `${Date.now()}`,

      //   receipt,

      //   bagTag: null,

      //   qrPayload,

      //   status: 'PENDING',
      // };

      // await saveJob(job);
      /**
* ----------------------------------
* 9. PRINT TICKET
* ----------------------------------
*/

      let printed = false;
      let attempts = 0;

      while (!printed && attempts < 10) {
        attempts++;

        try {
          if (printTicket) {
            printed = await printToPrinter(
              selectedPrinterMac,
              receipt,
            );

            if (!printed) {
              throw new Error(
                'Ticket print failed',
              );
            }
          } else {
            printed = true;
          }
        } catch (err) {
          console.log(err);

          setMsg({
            msg:
              'Printer unavailable. Retrying...',
            state: 'warning',
          });

          await new Promise(resolve =>
            setTimeout(resolve, 3000),
          );
        }
      }

      /**
       * ----------------------------------
       * 10. PRINT BAG TAGS
       * ----------------------------------
       */

      if (
        printQr &&
        luggage > 0
      ) {
        for (
          let i = 1;
          i <= luggage;
          i++
        ) {
          const currentTag =
            bagTag.replace(
              '{{BAG}}',
              `${i}/${luggage}`,
            );

          let tagPrinted = false;
          let tagAttempts = 0;

          while (
            !tagPrinted &&
            tagAttempts < 10
          ) {
            tagAttempts++;

            try {
              tagPrinted =
                await printToPrinter(
                  selectedPrinterMac,
                  currentTag,
                );

              if (!tagPrinted) {
                throw new Error(
                  'Bag tag print failed',
                );
              }
            } catch (err) {
              console.log(err);

              await new Promise(resolve =>
                setTimeout(
                  resolve,
                  3000,
                ),
              );
            }
          }
        }
      }

      /**
       * ----------------------------------
       * 11. REMOVE PRINT JOB
       * ----------------------------------
       */

      await removeJob(job.id);

      /**
       * ----------------------------------
       * 12. REFRESH DATA
       * ----------------------------------
       */

      await refetch();

      /**
       * ----------------------------------
       * 13. SUCCESS
       * ----------------------------------
       */

      setMsg({
        msg:
          'Ticket booked successfully.',
        state: 'success',
      });

      onSuccess?.(ticket);

      return {
        success: true,
        ticket,
        qrPayload,
      };
    } catch (error: any) {
      // console.log(error);

      setMsg({
        msg:
          error?.data?.message ||
          error?.message ||
          'Ticket booking failed.',
        state: 'error',
      });

      return {
        success: false,
      };
    }
  };

  return {
    submitTicket,
    loading,
    msg,
    setMsg,
  };
};
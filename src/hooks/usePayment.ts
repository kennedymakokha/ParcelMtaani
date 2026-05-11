import { useMemo, useState } from 'react';

export const usePayment = (parcelTotal: number) => {
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA'>('CASH');

  const [isSplitPayment, setIsSplitPayment] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');

  const [amountGiven, setAmountGiven] = useState('');

  const [mpesaPortion, setMpesaPortion] = useState('');

  const totals = useMemo(() => {
    const cash = parseFloat(amountGiven) || 0;

    const mpesa = parseFloat(mpesaPortion) || 0;

    const totalPaid = cash + mpesa;

    const remaining = parcelTotal - totalPaid;

    return {
      totalPaid,
      remaining,
    };
  }, [amountGiven, mpesaPortion, parcelTotal]);

  return {
    paymentMethod,
    setPaymentMethod,
    isSplitPayment,
    setIsSplitPayment,
    phoneNumber,
    setPhoneNumber,
    amountGiven,
    setAmountGiven,
    mpesaPortion,
    setMpesaPortion,
    totals,
  };
};
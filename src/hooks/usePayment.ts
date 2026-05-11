import { useMemo, useState } from 'react';

export const usePayment = (
  parcelTotal: number,
) => {
  const [paymentMethod, setPaymentMethod] =
    useState<'CASH' | 'MPESA'>('CASH');

  const [isSplitPayment, setIsSplitPayment] =
    useState(false);

  const [activeField, setActiveField] =
    useState<
      'PHONE' | 'CASH_AMT' | 'MPESA_AMT'
    >('CASH_AMT');

  const [phoneNumber, setPhoneNumber] =
    useState('');

  const [amountGiven, setAmountGiven] =
    useState('');

  const [mpesaPortion, setMpesaPortion] =
    useState('');

  const paymentTotals = useMemo(() => {
    const cash =
      parseFloat(amountGiven) || 0;

    const mpesa =
      isSplitPayment ||
      paymentMethod === 'MPESA'
        ? parseFloat(mpesaPortion) || 0
        : 0;

    const totalPaid = cash + mpesa;

    const remaining =
      parcelTotal - totalPaid;

    const netNeededAfterMpesa =
      Math.max(0, parcelTotal - mpesa);

    const change =
      cash > netNeededAfterMpesa
        ? cash - netNeededAfterMpesa
        : 0;

    return {
      totalPaid,
      remaining,
      change,
    };
  }, [
    amountGiven,
    mpesaPortion,
    parcelTotal,
    isSplitPayment,
    paymentMethod,
  ]);

  const handleKeypadChange = (
    v: string,
  ) => {
    if (activeField === 'PHONE') {
      setPhoneNumber(v);
    } else if (
      activeField === 'MPESA_AMT'
    ) {
      setMpesaPortion(v);
    } else {
      setAmountGiven(v);
    }
  };

  return {
    paymentMethod,
    setPaymentMethod,

    isSplitPayment,
    setIsSplitPayment,

    activeField,
    setActiveField,

    phoneNumber,

    amountGiven,

    mpesaPortion,

    setMpesaPortion,

    paymentTotals,

    handleKeypadChange,
  };
};
// =========================
// VALIDATION
// =========================

export const validateForm = ({
  formData,
  phoneNumber,
  mpesaPortion,
  setMsg,
  pickup,
  paymentMethod,
  isSplitPayment,
  amountGiven,
  parcelTotal,
}: any) => {
  // =========================
  // SENDER
  // =========================

  if (!formData.sender.name?.trim()) {
    setMsg({
      msg: 'Sender name is required',
      state: 'error',
    });

    return false;
  }

  if (!formData.sender.phone?.trim()) {
    setMsg({
      msg: 'Sender phone is required',
      state: 'error',
    });

    return false;
  }

  // =========================
  // RECEIVER
  // =========================

  if (!formData.receiver.name?.trim()) {
    setMsg({
      msg: 'Receiver name is required',
      state: 'error',
    });

    return false;
  }

  if (!formData.receiver.phone?.trim()) {
    setMsg({
      msg: 'Receiver phone is required',
      state: 'error',
    });

    return false;
  }

  // =========================
  // PARCEL
  // =========================

  if (!formData.parcel.weight?.toString().trim()) {
    setMsg({
      msg: 'Parcel weight is required',
      state: 'error',
    });

    return false;
  }

  if (Number(formData.parcel.weight) <= 0) {
    setMsg({
      msg: 'Parcel weight must be greater than 0',
      state: 'error',
    });

    return false;
  }

  if (!pickup) {
    setMsg({
      msg: 'Please select destination pickup',
      state: 'error',
    });

    return false;
  }

  if (!formData.parcel.price?.toString().trim()) {
    setMsg({
      msg: 'Parcel price is required',
      state: 'error',
    });

    return false;
  }

  if (Number(formData.parcel.price) <= 0) {
    setMsg({
      msg: 'Parcel price must be greater than 0',
      state: 'error',
    });

    return false;
  }

  // =========================
  // PAYMENT VALIDATION
  // =========================

  // CASH ONLY
  if (paymentMethod === 'CASH' && !isSplitPayment) {
    if (!amountGiven?.toString().trim()) {
      setMsg({
        msg: 'Cash amount is required',
        state: 'error',
      });

      return false;
    }

    if (Number(amountGiven) < parcelTotal) {
      setMsg({
        msg: 'Cash amount is insufficient',
        state: 'error',
      });

      return false;
    }
  }

  // MPESA ONLY
  if (paymentMethod === 'MPESA' && !isSplitPayment) {
    if (!phoneNumber?.trim()) {
      setMsg({
        msg: 'Mpesa phone number is required',
        state: 'error',
      });

      return false;
    }

    if (phoneNumber.trim().length < 9) {
      setMsg({
        msg: 'Enter a valid Mpesa phone number',
        state: 'error',
      });

      return false;
    }
  }

  // SPLIT PAYMENT
  if (isSplitPayment) {
    if (!phoneNumber?.trim()) {
      setMsg({
        msg: 'Mpesa phone number is required',
        state: 'error',
      });

      return false;
    }

    const cash = Number(amountGiven || 0);
    const mpesa = Number(mpesaPortion || 0);

    if (cash + mpesa < parcelTotal) {
      setMsg({
        msg: 'Total payment is insufficient',
        state: 'error',
      });

      return false;
    }
  }

  return true;
};
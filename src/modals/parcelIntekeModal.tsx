/* eslint-disable react-native/no-inline-styles */
import { useState } from 'react';
import {
  ScrollView,
} from 'react-native';

import { useSelector } from 'react-redux';
import { useTheme } from '../contexts/themeContext';
import { PrinterSelectionModal } from '../modals/printerSelect.model';
import { SectionHeader } from '../components/ui/sectionHeader';
import Toast from '../components/toast';
import { COUNTRIES } from '../utils/countryCodes';
import { PrimaryButton } from '../components/PrimaryButton.tsx';
import { useParcelSubmit } from '../hooks/useParcelSubmit.ts';
import { SenderSection } from './sections/SenderSection.tsx';
import { ReceiverSection } from './sections/ReceiverSection.tsx';
import { ParcelSection } from './sections/ParcelSection.tsx';
import { PaymentSection } from './sections/PaymentSection.tsx';
import { useParcelForm } from '../hooks/useParcelForm.ts';
import { usePayment } from '../hooks/usePayment.ts';
import { usePrinter } from '../hooks/usePrinter.ts';
import { useBluetoothPermissions } from '../hooks/useBluetoothPermissions.ts';
import { useQrPrinter } from '../hooks/useQrPrinter.ts';
import { SubmitButton } from './component/SubmitButton.tsx';

export default function ParcelIntakeScreen({ onClose, refetch }: any) {
  const { submitParcel, msg, setMsg, isProcessing } = useParcelSubmit();
  const { colors } = useTheme();
  const { user } = useSelector((state: any) => state.auth);
  const pickups = useSelector((state: any) => state.pickups.pickups);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [pickup, setPickup] = useState<any>('');
  const { formData, setFormData, updateField } = useParcelForm(user);

  const {
    selectedPrinterMac,
    showPrinterModal,
    setShowPrinterModal,
    selectPrinter,
  } = usePrinter();

  const parcelTotal = Number(formData.parcel.price || 0);
  const { qrPrintData, setQrPrintData, printQr } = useQrPrinter({
    selectedPrinterMac,
    onClose,
    setMsg,
  });
  const {
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
  } = usePayment(parcelTotal);
  // =========================
  // LOAD PRINTER
  // =========================

  useBluetoothPermissions();

 const handleSubmit = async () => {
  // Open printer selector if no printer chosen
  if (!selectedPrinterMac) {
    setShowPrinterModal(true);
    return;
  }

  await submitParcel({
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

    onSuccess: data => {
      setQrPrintData(data);
    },
  });
};
  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 96,
        paddingTop: 20,
      }}
    >
      <SectionHeader title="New parcel" />
      <SenderSection
        formData={formData}
        updateField={updateField}
        country={country}
        setCountry={setCountry}
        colors={colors}
      />

      <ReceiverSection
        formData={formData}
        updateField={updateField}
        country={country}
        setCountry={setCountry}
        colors={colors}
      />

      {/* ========================= */}
      {/* PARCEL */}
      {/* ========================= */}

      <ParcelSection
        formData={formData}
        updateField={updateField}
        setFormData={setFormData}
        colors={colors}
        pickups={pickups}
        user={user}
        setPickup={setPickup}
        pickup={pickup}
      />

      {/* ========================= */}
      {/* PAYMENT */}
      {/* ========================= */}
      <PaymentSection
        colors={colors}
        parcelTotal={parcelTotal}
        setIsSplitPayment={setIsSplitPayment}
        isSplitPayment={isSplitPayment}
        setActiveField={setActiveField}
        setPaymentMethod={setPaymentMethod}
        paymentMethod={paymentMethod}
        setMpesaPortion={setMpesaPortion}
        activeField={activeField}
        phoneNumber={phoneNumber}
        mpesaPortion={mpesaPortion}
        amountGiven={amountGiven}
        paymentTotals={paymentTotals}
        handleKeypadChange={handleKeypadChange}
      />

      {/* ========================= */}
      {/* TOAST */}
      {/* ========================= */}

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}

      {qrPrintData ? (
        <PrimaryButton onPress={printQr} title="Print QR Code" />
      ) : (
       <SubmitButton
  isProcessing={isProcessing}
  selectedPrinterMac={selectedPrinterMac}
  onPress={handleSubmit}
  colors={colors}
  title={
    selectedPrinterMac
      ? 'Generate & Print Receipt'
      : 'Select Printer First'
  }
/>
      )}

      {/* ========================= */}
      {/* PRINTER MODAL */}
      {/* ========================= */}

      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={selectPrinter}
      />
    </ScrollView>
  );
}

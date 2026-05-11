import { useState } from 'react';
import { printQrCode } from '../services /printer.service';

export const useQrPrinter = ({
  selectedPrinterMac,
  onClose,
  setMsg,
}: any) => {
  const [qrPrintData, setQrPrintData] = useState<any>(null);

  const printQr = async () => {
    try {
      await printQrCode(
        selectedPrinterMac,
        qrPrintData.qrData,
        qrPrintData.parcelCode,
      );

      await onClose();

      setMsg({
        msg: 'QR Code printed successfully',
        state: 'success',
      });
    } catch (error) {
      console.log(error);
      setMsg({
        msg: 'Failed to print QR code',
        state: 'error',
      });
    }
  };

  return {
    qrPrintData,
    setQrPrintData,
    printQr,
  };
};
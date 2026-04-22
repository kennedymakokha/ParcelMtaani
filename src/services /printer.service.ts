import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';
import { getShortCode } from '../utils/loationMaps';
import { ParcelFormData, QRPayload } from '../../types';

export const printToPrinter = async (
  macAddress: string | undefined,
  pickup: string = '',
  text: string = '',
  qrData: string | undefined,
  sixDigitNumber: string = '',
  printQr: boolean = false,
  logoBase64?: string
): Promise<boolean> => {
  if (!macAddress) throw new Error("No printer selected");

  try {
    const isConnected: boolean = await RNBluetoothClassic.isDeviceConnected(macAddress);

    const device: BluetoothDevice = isConnected
      ? await RNBluetoothClassic.getConnectedDevice(macAddress)
      : await RNBluetoothClassic.connectToDevice(macAddress);

    // ESC/POS Constants
    const ESC = 0x1b;
    const GS = 0x1d;

    const commands = {
      init: Buffer.from([ESC, 0x40]),
      leftAlign: Buffer.from([ESC, 0x61, 0x00]),
      centerAlign: Buffer.from([ESC, 0x61, 0x01]),
      fullCut: Buffer.from([GS, 0x56, 0x00]),
      resetFont: Buffer.from([ESC, 0x21, 0x00, ESC, 0x45, 0x00]),
    };

    // -----------------------------
    // LOGO SECTION
    // -----------------------------
    let logoBuffer = Buffer.alloc(0);
    if (logoBase64) {
      logoBuffer = Buffer.concat([
        commands.centerAlign,
        Buffer.from(logoBase64, 'base64'),
        Buffer.from('\n'),
      ]);
    }

    // -----------------------------
    // QR SECTION + Number
    // -----------------------------
    let qrBufferFinal = Buffer.alloc(0);

    if (printQr && qrData) {
      const qrDataBuffer = Buffer.from(qrData, 'utf8');
      const length = qrDataBuffer.length + 3;
      const pL = length % 256;
      const pH = Math.floor(length / 256);

      qrBufferFinal = Buffer.concat([
        commands.centerAlign,
        // QR Model, Size, Error Correction
        Buffer.from([GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),
        Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08]),
        Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30]),
        // Store and Print
        Buffer.from([GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]),
        qrDataBuffer,
        Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]),
        Buffer.from('\n'),
        // Large Bold Number
        Buffer.from([ESC, 0x61, 0x01, ESC, 0x21, 0x30, ESC, 0x45, 0x01]),
        Buffer.from(`${getShortCode(pickup)}-${sixDigitNumber}`, 'ascii'),
        commands.resetFont,
        Buffer.from('\n\n'),
      ]);
    }

    // -----------------------------
    // ASSEMBLE PAYLOAD
    // -----------------------------
    const fullPayload = Buffer.concat([
      commands.init,
      logoBuffer,
      commands.leftAlign,
      Buffer.from(text, 'utf8'),
      Buffer.from('\n\n'),
      qrBufferFinal,
      Buffer.from('\n\n\n'),
      commands.fullCut,
    ]);

    await device.write(fullPayload.toString('base64'), 'base64');
    return true;

  } catch (err) {
    console.error("Printer Hardware Error:", err);
    throw err;
  }
};

export const buildQrPayload = (formData: ParcelFormData): string => {
  const payload: QRPayload = {
    type: 'PARCEL',
    version: 1,
    timestamp: Date.now(),
    sender: formData.sender,
    receiver: formData.receiver,
    parcel: formData.parcel,
    receiptNo: formData.receiptNo ?? null,
  };

  return JSON.stringify(payload);
};
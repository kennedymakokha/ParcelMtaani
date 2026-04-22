import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';

/**
 * logoBase64 must be a MONOCHROME PNG converted to ESC/POS raster bytes.
 */
export const printToPrinter = async (
  macAddress?: string,
  text?: string,
  qrData?: string,
  sixDigitNumber?: string,
  printQr?: boolean,
  logoBase64?: string
) => {
  if (!macAddress) throw new Error("No printer selected");

  try {
    // Check connection
    const isConnected = await RNBluetoothClassic.isDeviceConnected(macAddress);

    const device = isConnected
      ? await RNBluetoothClassic.getConnectedDevice(macAddress)
      : await RNBluetoothClassic.connectToDevice(macAddress);

    // -----------------------------
    // ESC/POS COMMANDS
    // -----------------------------
    const init = '\x1B\x40';
    const leftAlign = '\x1B\x61\x00';
    const centerAlign = '\x1B\x61\x01';
    const feed = '\n\n';

    // Paper cut
    const fullCut = '\x1D\x56\x00';

    // -----------------------------
    // QR CODE COMMANDS
    // -----------------------------
    const qrModel = '\x1D\x28\x6B\x04\x00\x31\x41\x32\x00';
    const qrSize = '\x1D\x28\x6B\x03\x00\x31\x43\x08';
    const qrError = '\x1D\x28\x6B\x03\x00\x31\x45\x30';

    const qrStoreLen = qrData.length + 3;
    const pL = qrStoreLen % 256;
    const pH = Math.floor(qrStoreLen / 256);

    const qrStore =
      '\x1D\x28\x6B' +
      String.fromCharCode(pL) +
      String.fromCharCode(pH) +
      '\x31\x50\x30' +
      qrData;

    const qrPrint = '\x1D\x28\x6B\x03\x00\x31\x51\x30';

    // -----------------------------
    // LOGO SECTION
    // -----------------------------
    let logoSection = '';

    if (logoBase64) {
      const logoBuffer = Buffer.from(logoBase64, 'base64');
      logoSection = centerAlign + logoBuffer.toString('binary') + '\n';
    }
// -----------------------------
// QR SECTION + Number
// -----------------------------
let qrSection = '';

if (printQr && qrData) {
  const qrBuffer = Buffer.from(qrData, 'utf8');
  const length = qrBuffer.length + 3;

  const pL = length % 256;
  const pH = Math.floor(length / 256);

  const storeCommand = Buffer.concat([
    Buffer.from([0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]),
    qrBuffer,
  ]);

  
  qrSection = Buffer.concat([
    Buffer.from([
      0x1B, 0x61, 0x01,       // center
      0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00, // model
      0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x08,       // size
      0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x30,       // error
    ]),
    storeCommand,
    Buffer.from([0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]), // print QR
    Buffer.from('\n'),

    // Large bold number
    Buffer.from([
      0x1B, 0x61, 0x01, // center
      0x1B, 0x21, 0x30, // double height + double width
      0x1B, 0x45, 0x01, // emphasized (bold)
    ]),
    Buffer.from(sixDigitNumber, 'ascii'),
    Buffer.from([
      0x1B, 0x21, 0x00, // reset font size
      0x1B, 0x45, 0x00, // turn off bold
    ]),
    Buffer.from('\n\n'),
  ]).toString('binary');
}

    // -----------------------------
    // FINAL PRINT PAYLOAD
    // -----------------------------
    const fullPayload =
      init +
      logoSection +       // Logo first
      leftAlign +
      text +
      feed +
      qrSection +         // Optional QR
      '\n\n\n' +
      fullCut;

    const base64Payload = Buffer.from(fullPayload, 'binary').toString('base64');

    await device.write(base64Payload, 'base64');

    return true;

  } catch (err) {
    console.error("Printer Hardware Error:", err);
    throw err;
  }
};

export const buildQrPayload = (formData: any) => {
  const payload = {
    type: 'PARCEL',
    version: 1,
    timestamp: Date.now(),

    sender: formData.sender,
    receiver: formData.receiver,
    parcel: formData.parcel,

    receiptNo: formData.receiptNo || null,
  };

  return JSON.stringify(payload);
};
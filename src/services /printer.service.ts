import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';

/**
 * Build Barcode Buffer (CODE128)
 */
export const buildBarcodeBuffer = (barcodeData: string): Buffer => {
  const ESC = 0x1b;
  const GS = 0x1d;

  return Buffer.concat([
    // Center Align
    Buffer.from([ESC, 0x61, 0x01]),

    // Set Barcode Height (0x64 = 100 dots)
    Buffer.from([GS, 0x68, 0x64]),

    // Set Barcode Width (0x02 = Thin, 0x03 = Medium)
    Buffer.from([GS, 0x77, 0x02]),

    // Print Barcode (GS k m n d1...dn)
    // 0x49 is CODE128. {I is the ESC/POS subset C/B auto-switch
    Buffer.from([GS, 0x6b, 0x49, barcodeData.length + 2, 0x7b, 0x49]),
    Buffer.from(barcodeData, 'ascii'),

    Buffer.from('\n\n'), // Space after barcode to separate from text
  ]);
};

/**
 * Build QR Code Buffer
 */
const buildQrBuffer = (
  qrData: string,
  pickup: string,
  sixDigitNumber: string
): Buffer => {
  const ESC = 0x1b;
  const GS = 0x1d;

  const data = Buffer.from(qrData, 'utf8');
  const length = data.length + 3;
  const pL = length % 256;
  const pH = Math.floor(length / 256);

  return Buffer.concat([
    Buffer.from([ESC, 0x61, 0x01]), // Center
    Buffer.from([GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]), // Model
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x06]), // Size
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]), // Error correction
    Buffer.from([GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]), // Store data
    data,
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]), // Print
    Buffer.from('\n\n'),
    Buffer.from([ESC, 0x61, 0x01, ESC, 0x21, 0x25]), // Big text
    Buffer.from(`${sixDigitNumber}\n`, 'ascii'),
    Buffer.from([ESC, 0x21, 0x00]), // Reset
  ]);
};

export const printToPrinter = async (
  macAddress: string | undefined,
  pickup: string = '',
  text: string = '',
  qrData?: string,
  sixDigitNumber: string = '',
  printQr: boolean = false,
  // barcodeData?: string // <--- Added barcodeData parameter
): Promise<boolean> => {
  if (!macAddress) throw new Error('No printer selected');

  try {
    const isConnected = await RNBluetoothClassic.isDeviceConnected(macAddress);
    const device: BluetoothDevice = isConnected
      ? await RNBluetoothClassic.getConnectedDevice(macAddress)
      : await RNBluetoothClassic.connectToDevice(macAddress);

    const ESC = 0x1b;
    const GS = 0x1d;

    const commands = {
      init: Buffer.from([ESC, 0x40]),
      leftAlign: Buffer.from([ESC, 0x61, 0x00]),
      cut: Buffer.from([GS, 0x56, 0x00]),
    };

    // Prepare Barcode Buffer
    // let barcodeBuffer = Buffer.alloc(0);
    // if (barcodeData) {
    //   barcodeBuffer = buildBarcodeBuffer(barcodeData);
    // }

    // Prepare QR Buffer
    let qrBuffer = Buffer.alloc(0);
    if (printQr && qrData) {
      qrBuffer = buildQrBuffer(qrData, pickup, sixDigitNumber);
    }

    const payload = Buffer.concat([
      commands.init,

      // 1. BARCODE AT THE TOP
      

      // 2. MAIN RECEIPT TEXT
      commands.leftAlign,
      Buffer.from(text, 'utf8'),
       Buffer.from('\n'),
      //  barcodeBuffer,
      Buffer.from('\n'),

      // 3. QR CODE AT BOTTOM
      qrBuffer,

      Buffer.from('\n\n\n'),

      // 4. CUT
      commands.cut,
    ]);

    // Send the full buffer as base64
    await device.write(payload.toString('base64'), 'base64');

    return true;
  } catch (err) {
    console.error('PRINT ERROR:', err);
    throw err;
  }
};
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Buffer } from 'buffer';

/**
 * Build QR Code Buffer (STABLE VERSION)
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
    // Center align
    Buffer.from([ESC, 0x61, 0x01]),

    // Select QR model
    Buffer.from([GS, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]),

    // Size (try 4–8 if issues)
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x06]),

    // Error correction
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31]),

    // Store data
    Buffer.from([GS, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30]),
    data,

    // Print QR
    Buffer.from([GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30]),

    Buffer.from('\n\n'),

    // Big Code Text
    Buffer.from([ESC, 0x61, 0x01, ESC, 0x21, 0x30]),
    Buffer.from(`${pickup}-${sixDigitNumber}\n`, 'ascii'),

    // Reset
    Buffer.from([ESC, 0x21, 0x00]),
  ]);
};

export const printToPrinter = async (
  macAddress: string | undefined,
  pickup: string = '',
  text: string = '',
  qrData?: string,
  sixDigitNumber: string = '',
  printQr: boolean = false
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
      centerAlign: Buffer.from([ESC, 0x61, 0x01]),
      cut: Buffer.from([GS, 0x56, 0x00]),
    };

    let qrBuffer = Buffer.alloc(0);

    if (printQr && qrData) {
      qrBuffer = buildQrBuffer(qrData, pickup, sixDigitNumber);
    }

    const payload = Buffer.concat([
      commands.init,

      // TEXT
      commands.leftAlign,
      Buffer.from(text, 'utf8'),

      Buffer.from('\n\n'),

      // QR
      qrBuffer,

      Buffer.from('\n\n\n'),

      // CUT
      commands.cut,
    ]);

    await device.write(payload.toString('base64'), 'base64');

    return true;
  } catch (err) {
    console.error('PRINT ERROR:', err);
    throw err;
  }
};
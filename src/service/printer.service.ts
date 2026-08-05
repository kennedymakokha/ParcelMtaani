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


export const printToPrinter = async (
  macAddress: string | undefined,

  text: string = '',
 

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

 
   

    const payload = Buffer.concat([
      commands.init,

      commands.leftAlign,

      Buffer.from(text, 'utf8'),

      Buffer.from('\n\n\n'),

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


export const printQrCode = async (
  macAddress: string,
  qrData: string,
  parcelCode: string,
): Promise<boolean> => {
  if (!macAddress) {
    throw new Error('No printer selected');
  }

  try {
    const isConnected =
      await RNBluetoothClassic.isDeviceConnected(macAddress);

    const device: BluetoothDevice = isConnected
      ? await RNBluetoothClassic.getConnectedDevice(macAddress)
      : await RNBluetoothClassic.connectToDevice(macAddress);

    const ESC = 0x1b;
    const GS = 0x1d;

    const qrBuffer = Buffer.from(qrData, 'utf8');

    const storeLen = qrBuffer.length + 3;

    const pL = storeLen & 0xff;

    const pH = (storeLen >> 8) & 0xff;

    const payload = Buffer.concat([
      // init
      Buffer.from([ESC, 0x40]),

      // center align
      Buffer.from([ESC, 0x61, 0x01]),

      /**
       * SELECT QR MODEL
       */
      Buffer.from([
        GS,
        0x28,
        0x6b,
        0x04,
        0x00,
        0x31,
        0x41,
        0x32,
        0x00,
      ]),

      /**
       * QR SIZE
       * 1-16
       */
      Buffer.from([
        GS,
        0x28,
        0x6b,
        0x03,
        0x00,
        0x31,
        0x43,
        0x06,
      ]),

      /**
       * ERROR CORRECTION
       */
      Buffer.from([
        GS,
        0x28,
        0x6b,
        0x03,
        0x00,
        0x31,
        0x45,
        0x30,
      ]),

      /**
       * STORE QR DATA
       */
      Buffer.from([
        GS,
        0x28,
        0x6b,
        pL,
        pH,
        0x31,
        0x50,
        0x30,
      ]),

      qrBuffer,

      /**
       * PRINT QR
       */
      Buffer.from([
        GS,
        0x28,
        0x6b,
        0x03,
        0x00,
        0x31,
        0x51,
        0x30,
      ]),

      Buffer.from('\n\n'),

      /**
       * PARCEL CODE
       */
      Buffer.from([ESC, 0x45, 0x01]), // bold on

      Buffer.from([ESC, 0x21, 0x20]), // double height

      Buffer.from(`${parcelCode}\n`, 'ascii'),

      Buffer.from([ESC, 0x21, 0x00]),

      Buffer.from([ESC, 0x45, 0x00]),

      Buffer.from('\n\n\n'),

      /**
       * CUT
       */
      Buffer.from([GS, 0x56, 0x00]),
    ]);

    /**
     * IMPORTANT:
     * Some printers fail on huge writes.
     */
    await device.write(payload.toString('base64'), 'base64');

    return true;
  } catch (error) {
    console.log('QR PRINT ERROR', error);

    throw error;
  }
};
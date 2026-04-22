import { NativeModules } from 'react-native';

const { QRScanner } = NativeModules;

export const scanQRCode = async (): Promise<string> => {
  if (!QRScanner) {
    throw new Error(
      "QRScanner native module is not linked. Did you forget to add QRScannerPackage to MainApplication and rebuild?"
    );
  }
  return QRScanner.startScan();
};
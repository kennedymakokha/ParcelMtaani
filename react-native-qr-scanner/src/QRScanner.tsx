import React from 'react';
import { requireNativeComponent, ViewProps } from 'react-native';

type Props = ViewProps & {
  onResult?: (event: { nativeEvent: { data: string } }) => void;
};

const NativeQRScanner = requireNativeComponent<Props>('QRScannerView');

export default function QRScanner(props: Props) {
  return <NativeQRScanner {...props} />;
}

/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';

export const SubmitButton = ({
  isProcessing,
  selectedPrinterMac,
  onPress,
  colors,
  title
}: any) => {
  return (
    <TouchableOpacity
      disabled={isProcessing}
      onPress={onPress}
      style={{
        backgroundColor: isProcessing
          ? colors.border
          : selectedPrinterMac
          ? colors.primary
          : colors.error,
        padding: 18,
        borderRadius: 12,
      }}
    >
      {isProcessing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={{
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
           {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
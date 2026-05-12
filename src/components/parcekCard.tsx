/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const ParcelCard = ({ onPress,item,colors }: any) => {
 

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontWeight: '600', color: colors.text }}>
        Pickup: {item.pickup?.pickup_name}
      </Text>
      <Text style={{ color: colors.secondary }}>
        From: {item.sentFrom?.pickup_name}
      </Text>
      <Text style={{ color: colors.primary, marginTop: 4 }}>
        Code: {item.code}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontWeight: '600',
          color:
            item.status === 'Delivered'
              ? colors.success
              : item.status === 'In Transit'
              ? colors.warning
              : colors.error,
        }}
      >
        Status: {item.status}
      </Text>
    </TouchableOpacity>
  );
};

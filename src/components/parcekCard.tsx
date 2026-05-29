/* eslint-disable react-native/no-inline-styles */
import React, { useRef } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../contexts/themeContext';

interface ParcelCardProps {
  onPress: () => void;
  onDoublePress: () => void; // 👈 New prop for handling the double tap event
  item: any;
  colors: any;
}

export const ParcelCard = ({
  onPress,
  onDoublePress,
  item,
  
}: ParcelCardProps) => {
  const lastTap = useRef<number | null>(null);
  const { colors } = useTheme();
  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // time window in milliseconds

    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // 💥 DOUBLE TAP DETECTED
      lastTap.current = null; // reset
      onDoublePress();
    } else {
      // 👆 SINGLE TAP DETECTED
      lastTap.current = now;
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress} // 👈 Managed locally inside the card component
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        // Optional: Highlight the card slightly if it's currently selected for tracking
      }}
    >
      <Text style={{ fontWeight: '600', color: colors.text }}>
        Pickup: {item.pickup?.pickup_name}
      </Text>
      <Text style={{ color: colors.subText, marginTop: 4 }}>
        From: {item.sentFrom?.pickup_name}
      </Text>
      <Text style={{ color: colors.subText, marginTop: 4 }}>
        Code: {item.code}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontWeight: '600',
          color: item.parcel?.fragile ? 'red' : colors.text,
        }}
      >
        Desc: {item.instructions}
      </Text>
    </TouchableOpacity>
  );
};

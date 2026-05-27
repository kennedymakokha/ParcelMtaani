/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from '../contexts/themeContext'; // Adjust path as needed

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
}: SecondaryButtonProps) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          borderColor: disabled ? (colors.border || '#e2e8f0') : (colors.secondary || '#f97316'),
          backgroundColor: disabled ? (colors.border || '#f1f5f9') : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: disabled ? (colors.subText || '#94a3b8') : (colors.secondary || '#f97316'),
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 52, // Matches the premium form layout height perfectly
    borderRadius: 12, // Modern smooth curvature radius
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
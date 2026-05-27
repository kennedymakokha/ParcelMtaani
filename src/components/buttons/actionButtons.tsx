/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/themeContext';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'error' | 'secondary';
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  style,
}) => {
  const { colors } = useTheme();

  // 1. Map solid structural backgrounds safely
  const getBackgroundAndTextColor = () => {
    switch (type) {
      case 'error':
        return {
          bg: colors.error || '#dc2626',
          text: '#ffffff', // Locks contrast safely against bright alert states
        };
      case 'secondary':
        return {
          bg: colors.secondary || '#f97316', // Showcases your bright secondary brand orange
          text: '#ffffff', // Clean contrast for light or dark mode setups
        };
      case 'primary':
      default:
        return {
          bg: colors.primary || '#2563eb',
          text: '#ffffff', // Ensures deep branding states remain high-contrast
        };
    }
  };

  const currentThemeConfigs = getBackgroundAndTextColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.button, 
        { backgroundColor: currentThemeConfigs.bg }, 
        style
      ]}
    >
      <Text style={[styles.text, { color: currentThemeConfigs.text }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// ==========================================
// UNIFIED ACTION ACTION SHEET DESIGN
// ==========================================
const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80, // Ensures actions stay easy to press on small view screens
  },
  text: {
    fontWeight: '700', // Boosted weight for clean micro-typography legibility
    fontSize: 13,
    letterSpacing: 0.1,
  },
});
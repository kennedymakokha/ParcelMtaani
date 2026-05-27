/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/themeContext'; // Adjust path as needed

interface TertiaryButtonProps {
  title: string;
  onPress: () => void;
  color?: string; // Explicit theme override option
}

export const TertiaryButton = ({
  title,
  onPress,
 
}: TertiaryButtonProps) => {
  const { colors } = useTheme();

  // 1. Prioritize explicit prop override
  // 2. Fallback to global theme primary context link token
  // 3. Absolute hardware core fallback string
  const finalLinkColor =  colors.secondary ;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.6}
      style={styles.touchableTarget}
    >
      <Text 
        style={[
          styles.linkText, 
          { color: finalLinkColor }
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// ==========================================
// ALIGNED INTERACTIVE TYPOGRAPHY
// ==========================================
const styles = StyleSheet.create({
  touchableTarget: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600', // Crisp, modern weight balance
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/themeContext';

interface SectionHeaderProps {
  title: string;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: colors.background }, // Merges cleanly with the core view canvas
        style
      ]}
    >
      <Text 
        style={[
          styles.text, 
          { color: colors.subText || '#64748b' } // Styled gracefully with secondary typography tones
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

// ==========================================
// ALIGNED TYPOGRAPHIC SECTION DESIGN
// ==========================================
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Left-aligned baseline anchor
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  text: {
    fontSize: 12, // Reduced to a crisp, punchy meta-label size
    fontWeight: '800', // Heavy weight to balance out the smaller font size
    textTransform: 'uppercase',
    letterSpacing: 1.2, // Enhanced breathing room across capitalized text lines
    textAlign: 'left',
  },
});
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface FabProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  style?: ViewStyle;
}

export const Fab: React.FC<FabProps> = ({
  onPress,
  icon = 'add',
  size = 56, // Golden standard mobile hit target circle sizing diameter
  style,
}) => {
  const { colors } = useTheme();

  // Highlight action using the Secondary Orange theme token
  const actionColor = colors.secondary || '#f97316';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: actionColor,
          // Sophisticated matching glow footprint
          shadowColor: Platform.OS === 'ios' ? actionColor : '#000000',
        },
        style,
      ]}
    >
      {/* High contrast sharp white indicator layout icon */}
      <Icon name={icon} size={26} color="#ffffff" />
    </TouchableOpacity>
  );
};

// ==========================================
// CENTRALIZED COMPONENT ELEVATION STYLING
// ==========================================
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    
    // Smooth micro-shadow specs
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
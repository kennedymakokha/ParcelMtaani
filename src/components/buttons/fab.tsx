import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
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
  size = 56,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2, // ✅ perfect circle
          backgroundColor: colors.primary,
          shadowColor: colors.shadow || '#000',
        },
        style,
      ]}
    >
      <Icon name={icon} size={28} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
    justifyContent: 'center',

    // iOS shadow
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },

    // Android elevation
    elevation: 6,
  },
});
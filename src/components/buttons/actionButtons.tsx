import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/themeContext';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'error' | 'secondary'; // choose color variant
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  style,
}) => {
  const { colors } = useTheme();

  const backgroundColor =
    type === 'primary'
      ? colors.primary
      : type === 'error'
      ? colors.error
      : colors.secondary;

  const textColor =
    type === 'primary'
      ? colors.text
      : type === 'error'
      ? colors.text
      : colors.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor }, style]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
});

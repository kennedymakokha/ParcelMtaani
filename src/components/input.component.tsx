import React from "react";
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle
} from "react-native";
import { useTheme } from "../contexts/themeContext";

interface FormInputProps {
  label: string;
  placeholder?: string; // Optional to prevent strict errors if missing
  keyboardType?: KeyboardTypeOptions; // Use built-in RN types
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  containerStyle?: StyleProp<ViewStyle>; // Allow layout overrides
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  keyboardType = "default",
  multiline = false,
  value,
  onChangeText,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text
        style={[
          styles.label,
          { color: colors.text }
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            color: colors.text,
             backgroundColor: colors.card,
            // backgroundColor: colors.background,
            // Adjust height for multiline
            minHeight: multiline ? 80 : 48,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary || "#999"}
        keyboardType={keyboardType}
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
});
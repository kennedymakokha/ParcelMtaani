import React from "react";
import { View, Text, TextInput } from "react-native";
import { useTheme } from "../contexts/themeContext";

interface FormInputProps {
  label: string;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const FormInput = ({
  label,
  placeholder,
  keyboardType = "default",
  multiline = false,
  value,
  onChangeText,
}: FormInputProps) => {
  const { colors, typography } = useTheme();

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          color: colors.text,
          backgroundColor: colors.background,
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        keyboardType={keyboardType}
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

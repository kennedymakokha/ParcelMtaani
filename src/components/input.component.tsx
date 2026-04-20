import React from "react";
import { View, Text, TextInput } from "react-native";

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
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 text-black rounded-lg p-3 bg-white"
        placeholder={placeholder}
        placeholderTextColor="#000000"
        keyboardType={keyboardType}
        multiline={multiline}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

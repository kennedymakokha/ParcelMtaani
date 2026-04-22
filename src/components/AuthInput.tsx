import React from "react";
import { View, Text, TextInput } from "react-native";

interface AuthInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

export const AuthInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}: AuthInputProps) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 bg-white"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
    </View>
  );
};

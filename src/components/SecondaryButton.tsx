import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
}: SecondaryButtonProps) => {
  return (
    <TouchableOpacity
      className={`p-4 rounded-lg border ${
        disabled ? "border-gray-300 bg-gray-100" : "border-blue-600 bg-white"
      }`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        className={`text-center font-semibold text-lg ${
          disabled ? "text-gray-400" : "text-blue-600"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

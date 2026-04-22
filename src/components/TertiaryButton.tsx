import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface TertiaryButtonProps {
  title: string;
  onPress: () => void;
  color?: string; // allow theme flexibility
}

export const TertiaryButton = ({
  title,
  onPress,
  color = "#2563eb", // default theme blue
}: TertiaryButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text className="text-center font-semibold" style={{ color }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

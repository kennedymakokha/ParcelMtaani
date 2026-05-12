/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "../contexts/themeContext";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline";
}

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  variant = "primary",
}: PrimaryButtonProps) => {

  const { colors } = useTheme();

  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    });

    return () => unsubscribe();

  }, []);

  const disabled = loading || isOffline;

  // ✅ Variant styles
  const getButtonStyle = (): ViewStyle => {

    switch (variant) {

      case "secondary":
        return {
          backgroundColor: disabled ? "#d1d5db" : "#6b7280",
        };

      case "danger":
        return {
          backgroundColor: disabled ? "#fca5a5" : "#dc2626",
        };

      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: disabled ? "#93c5fd" : colors.primary,
        };

      case "primary":
      default:
        return {
          backgroundColor: disabled ? "#93c5fd" : colors.primary,
        };
    }
  };

  const getTextStyle = (): TextStyle => {

    switch (variant) {

      case "outline":
        return {
          color: disabled ? "#93c5fd" : colors.primary,
        };

      default:
        return {
          color: "#fff",
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          padding: 16,
          borderRadius: 12,
          marginBottom: 12,
          opacity: disabled ? 0.7 : 1,
        },
        getButtonStyle(),
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : "#fff"}
        />
      ) : (
        <Text
          style={[
            {
              fontWeight: "700",
              textAlign: "center",
            },
            getTextStyle(),
          ]}
        >
          {isOffline ? "No Internet Connection" : title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
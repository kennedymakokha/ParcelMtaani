/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from "react-native";
import { useTheme } from "../contexts/themeContext";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean; // Accept an explicit parent constraint state flag
  variant?: "primary" | "secondary" | "danger" | "outline";
}

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}: PrimaryButtonProps) => {
  const { colors } = useTheme();
  const isInteractionDisabled = loading || disabled;

  // Determine dynamic variant styling rules using real theme tokens
  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case "secondary":
        return {
          // Locks in colors.secondary (Orange) as the standalone variant background
          backgroundColor: isInteractionDisabled 
            ? `${colors.secondary || '#f97316'}60` 
            : (colors.secondary || '#f97316'),
        };

      case "danger":
        return {
          backgroundColor: isInteractionDisabled 
            ? `${colors.danger || '#dc2626'}60` 
            : (colors.danger || '#dc2626'),
        };

      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderColor: isInteractionDisabled 
            ? `${colors.primary || '#2563eb'}40` 
            : (colors.primary || '#2563eb'),
        };

      case "primary":
      default:
        return {
          backgroundColor: isInteractionDisabled 
            ? `${colors.primary || '#2563eb'}60` 
            : (colors.primary || '#2563eb'),
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "outline":
        return {
          color: isInteractionDisabled 
            ? `${colors.primary || '#2563eb'}60` 
            : (colors.primary || '#2563eb'),
        };
      default:
        return {
          color: "#ffffff",
        };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getButtonStyle(),
      ]}
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? (colors.primary || '#2563eb') : "#ffffff"}
          size="small"
        />
      ) : (
        <Text style={[styles.baseText, getTextStyle()]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ==========================================
// UNIFIED LAYOUT PRODUCTION DESIGN SHEET
// ==========================================
const styles = StyleSheet.create({
  baseButton: {
    width: '100%',
    height: 52, // Perfectly balances your 52dp form input height for premium rhythm
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  baseText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useTheme } from "../contexts/themeContext";


export const PrimaryButton = ({ title, onPress, loading = false }:any) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: loading ? "#93c5fd" : colors.primary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
      }}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

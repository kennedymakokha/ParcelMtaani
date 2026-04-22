import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { scanQRCode } from "../../modules/react-native-qr-scanner/src";
import { useTheme } from "../contexts/themeContext";

export default function ScannerScreen() {
  const { colors } = useTheme();
  const [parcels, setParcels] = useState<any[]>([]);

  const handleScan = async () => {
    try {
      const data = await scanQRCode();
      const parsed = JSON.parse(data);
      setParcels((prev) => [...prev, parsed]);
    } catch (err) {
      console.log("Scanner closed or failed", err);
    }
  };

  const renderParcel = ({ item }:any) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOpacity: 0.1,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
        From: {item.from}
      </Text>
      <Text style={{ color: colors.secondary, marginTop: 4 }}>
        Pickup: {item.pickup}
      </Text>
      <Text style={{ color: colors.primary, marginTop: 4, fontWeight: "500" }}>
        Code: {item.code}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Parcel List */}
      <FlatList
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        data={parcels}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        renderItem={renderParcel}
        ListEmptyComponent={
          <Text style={{ color: colors.secondary, textAlign: "center" }}>
            No parcels scanned yet
          </Text>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleScan}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 50,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
          Scan New
        </Text>
      </TouchableOpacity>
    </View>
  );
}

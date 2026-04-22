import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/themeContext";

export default function DispatchToCustomerScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const parcels=[
    { id: "1", from: "ParcelApp Nairobi", pickup: "Kitale (Hindu Temple)", code: "KIT-123456" },
    { id: "2", from: "ParcelApp Nairobi", pickup: "Eldoret (Kiteleele Stop)", code: "ELD-654321" },
    { id: "3", from: "ParcelApp Nairobi", pickup: "Nairobi (Gikomba)", code: "NBO-987654" },
  ];

  // Filter parcels by search term
  const filteredParcels = parcels.filter(
    (p) =>
      p.pickup.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

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
      <TouchableOpacity
        style={{
          marginTop: 12,
          backgroundColor: colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
        }}
        onPress={() => console.log(`Dispatching parcel ${item.code}`)}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          Dispatch
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 16 }}>
        Dispatch to Customer
      </Text>

      {/* Search Bar */}
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.text,
          marginBottom: 20,
        }}
        placeholder="Search by pickup or code..."
        placeholderTextColor={colors.secondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Parcel List */}
      <FlatList
        data={filteredParcels}
        keyExtractor={(item) => item.id}
        renderItem={renderParcel}
        ListEmptyComponent={
          <Text style={{ color: colors.secondary, textAlign: "center" }}>
            No parcels found
          </Text>
        }
      />
    </View>
  );
}

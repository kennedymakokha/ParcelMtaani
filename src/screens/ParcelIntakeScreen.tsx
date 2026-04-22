import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal } from "react-native";
import { useTheme } from "../contexts/themeContext";
import ParcelIntakeScreen from "../modals/parcelIntekeModal";

export default function DispatchToTrackScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState<any[]>([]);

  const [vehicleReg, setVehicleReg] = useState("");
  const [driverName, setDriverName] = useState("");

  const [parcels, setParcels] = useState([
    { id: "1", from: "ParcelApp Nairobi", pickup: "Kitale (Hindu Temple)", code: "KIT-123456", status: "In Transit" },
    { id: "2", from: "ParcelApp Nairobi", pickup: "Eldoret (Kiteleele Stop)", code: "ELD-654321", status: "Delivered" },
    { id: "3", from: "ParcelApp Nairobi", pickup: "Nairobi (Gikomba)", code: "NBO-987654", status: "Pending Dispatch" },
  ]);

  const filteredParcels = parcels.filter(
    (p) =>
      p.pickup.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (item: any) => {
    if (item.status !== "Pending Dispatch") return;
    setSelectedParcels((prev) =>
      prev.find((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item]
    );
  };

  const renderParcel = ({ item }: { item: any }) => {
    const isSelected = selectedParcels.find((p) => p.id === item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={{
          backgroundColor: isSelected ? colors.primaryLight : colors.card,
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
        <Text
          style={{
            marginTop: 8,
            fontWeight: "600",
            color:
              item.status === "Delivered"
                ? colors.success
                : item.status === "In Transit"
                ? colors.warning
                : colors.danger,
          }}
        >
          Status: {item.status}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 16 }}>
        Dispatch to Track
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

      {/* Track Button (enabled if pending selected) */}
      {selectedParcels.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowTrackModal(true)}
          style={{
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
            Track Selected ({selectedParcels.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Floating Action Button to open Intake Modal */}
      <TouchableOpacity
        onPress={() => setShowIntakeModal(true)}
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
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 20 }}>＋</Text>
      </TouchableOpacity>

      {/* Intake Modal */}
      <Modal visible={showIntakeModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end",paddingTop: 16, paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => setShowIntakeModal(false)}
               className="flex items-center justify-center p-1 rounded-md"
              style={{
                backgroundColor: colors.error,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ParcelIntakeScreen />
        </View>
      </Modal>

      {/* Track Modal */}
      <Modal visible={showTrackModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "#000000aa", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
              Vehicle & Driver Details
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
                color: colors.text,
              }}
              placeholder="Vehicle Registration"
              placeholderTextColor={colors.secondary}
              value={vehicleReg}
              onChangeText={setVehicleReg}
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
                color: colors.text,
              }}
              placeholder="Driver Name"
              placeholderTextColor={colors.secondary}
              value={driverName}
              onChangeText={setDriverName}
            />
            <TouchableOpacity
              onPress={() => {
                console.log("Dispatching:", selectedParcels, vehicleReg, driverName);
                setShowTrackModal(false);
                setSelectedParcels([]);
              }}
              style={{
                backgroundColor: colors.primary,
                padding: 14,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                Confirm Dispatch
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowTrackModal(false)}
              style={{
                marginTop: 10,
                backgroundColor: colors.error,
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

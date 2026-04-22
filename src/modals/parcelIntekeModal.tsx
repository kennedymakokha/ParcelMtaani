import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FormInput } from "../components/input.component";
import { PrinterSelectionModal } from "../modals/printerSelect.model";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../contexts/themeContext";

import { getShortCode } from "../utils/loationMaps";
import { ParcelFormState } from "../../types";
import { buildReceiptText } from "../services /recieptBuilder";
import { printToPrinter } from "../services /printer.service";

export default function ParcelIntakeScreen() {
  const { colors } = useTheme();

  // State with strict types
  const [destination, setDestination] = useState<string>("pickup");
  const [pickup, setPickup] = useState<string>("Kitale(Hindu Temple)");
  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const [formData, setFormData] = useState<ParcelFormState>({
    sender: { name: "", phone: "", address: "" },
    receiver: { name: "", phone: "", address: "" },
    parcel: { weight: "", instructions: "", destination: "pickup", pickup: "", price: "" },
  });

  // Load saved printer on mount
  useEffect(() => {
    const loadPrinter = async () => {
      const saved = await AsyncStorage.getItem("SELECTED_PRINTER_MAC");
      if (saved) setSelectedPrinterMac(saved);
    };
    loadPrinter();
  }, []);

  // Strictly typed update function
  const updateField = <K extends keyof ParcelFormState, F extends keyof ParcelFormState[K]>(
    section: K,
    field: F,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!selectedPrinterMac) {
      setShowPrinterModal(true);
      return;
    }

    try {
      const sixDigitNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const receiptNo = `INV${sixDigitNumber}`;

      // 1. Build Text Payload
      const receiptText = buildReceiptText({
        receiptNo,
        invoiceId: receiptNo,
        sender: formData.sender,
        reciever: formData.receiver,
        parcel: formData.parcel,
        sixDigitNumber,
        destination,
        pickup,
        paid: Number(formData.parcel.price) || 0,
        paidCash: Number(formData.parcel.price) || 0,
        totals: { finalTotal: Number(formData.parcel.price) || 0 },
        user: { name: "Admin" },
      });

      // 2. Build QR Data
      const qrData = JSON.stringify({
        id: receiptNo,
        reciever: formData.receiver,
        pickup,
        code: `${getShortCode(pickup)}-${sixDigitNumber}`,
        from:"ParcelApp Nairobi"
      });

      // 3. Print (Handled by our strict service)
      const success = await printToPrinter(
        selectedPrinterMac,
        pickup,
        receiptText,
        qrData,
        sixDigitNumber,
        true
      );

      if (success) {
        Alert.alert("Success", "Receipt printed successfully!");
      }
    } catch (error) {
      Alert.alert("Printer Error", error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 96, paddingTop: 20 }}
    >
      {/* Sender Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Sender Details</Text>
        <FormInput label="Sender Name" value={formData.sender.name} onChangeText={(t) => updateField("sender", "name", t)} />
        <FormInput label="Sender Phone" keyboardType="phone-pad" value={formData.sender.phone} onChangeText={(t) => updateField("sender", "phone", t)} />
        <FormInput label="Sender Address" value={formData.sender.address} onChangeText={(t) => updateField("sender", "address", t)} />
      </View>

      {/* Receiver Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Receiver Details</Text>
        <FormInput label="Recipient Name" value={formData.receiver.name} onChangeText={(t) => updateField("receiver", "name", t)} />
        <FormInput label="Recipient Phone" keyboardType="phone-pad" value={formData.receiver.phone} onChangeText={(t) => updateField("receiver", "phone", t)} />
        <FormInput label="Recipient Address" value={formData.receiver.address} onChangeText={(t) => updateField("receiver", "address", t)} />
      </View>

      {/* Parcel Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Parcel Details</Text>
        <FormInput label="Weight (kg)" keyboardType="numeric" value={formData.parcel.weight} onChangeText={(t) => updateField("parcel", "weight", t)} />
        <FormInput label="Price (KES)" keyboardType="numeric" value={formData.parcel.price} onChangeText={(t) => updateField("parcel", "price", t)} />
        <FormInput label="Special Instructions" multiline value={formData.parcel.instructions} onChangeText={(t) => updateField("parcel", "instructions", t)} />

        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8, marginTop: 12 }}>Destination Type</Text>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12 }}>
          <Picker selectedValue={destination} onValueChange={(v) => setDestination(v)}>
            <Picker.Item label="Pickup" value="pickup" />
            <Picker.Item label="Drop-off" value="dropoff" />
          </Picker>
        </View>

        {destination === "pickup" && (
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}>
            <Picker selectedValue={pickup} onValueChange={(v) => setPickup(v)}>
              <Picker.Item label="Kitale (Hindu Temple)" value="Kitale(Hindu Temple)" />
              <Picker.Item label="Kitale (Museum Point)" value="Kitale(Museum Point)" />
              <Picker.Item label="Eldoret (Kiteleele Stop)" value="Eldoret(Kiteleele Stop)" />
              <Picker.Item label="Nairobi (Museum Point)" value="Nairobi(Museum Point)" />
              <Picker.Item label="Nairobi (Gikomba)" value="Nairobi(Gikomba)" />
              <Picker.Item label="Nairobi (Eastleigh)" value="Nairobi(Eastleigh)" />
            </Picker>
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: selectedPrinterMac ? colors.primary : colors.error,
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>
          {selectedPrinterMac ? "Generate & Print Receipt" : "Select Printer First"}
        </Text>
      </TouchableOpacity>

      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={(mac) => {
          setSelectedPrinterMac(mac);
          AsyncStorage.setItem("SELECTED_PRINTER_MAC", mac);
          setShowPrinterModal(false);
        }}
      />
    </ScrollView>
  );
}
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FormInput } from "../components/input.component";
import { PrinterSelectionModal } from "../modals/printerSelect.model";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../contexts/themeContext";
import { buildReceiptText } from "../services /recieptBuilder";
import { printToPrinter } from "../services /printer.service";

export default function ParcelIntakeScreen() {
  const { colors } = useTheme();

  const [destination, setDestination] = useState("pickup");
  const [pickup, setPickup] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const [formData, setFormData] = useState({
    sender: { name: "", phone: "", address: "" },
    receiver: { name: "", phone: "", address: "" },
    parcel: { weight: "", instructions: "", destination: "pickup", pickup: "", price: "" },
    printerMac: null,
  });

  const updateField = (section: any, field: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const sixDigitNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const receiptNo = `INV${sixDigitNumber}`;
    const receiptText = buildReceiptText({
      receiptNo,
      invoiceId: "INV-001",
      sender: formData.sender,
      reciever: formData.receiver,
      parcel: formData.parcel,
      sixDigitNumber,
      destination,
      pickup,
      paid: Number(formData.parcel.price),
      paidCash: Number(formData.parcel.price),
      totals: { finalTotal: Number(formData.parcel.price) },
      user: { name: "Admin" },
    });

    // const qrData = JSON.stringify({ id: receiptNo, phone: formData.receiver.phone });
      const qrData = JSON.stringify({
      id: receiptNo,
      reciever: formData.receiver,
    });
    await printToPrinter(selectedPrinterMac, receiptText, qrData, sixDigitNumber,true);
    console.log("Submitted:", notes, formData);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingBottom: 96 }}>
      {/* Sender Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24, shadowOpacity: 0.1 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Sender Details</Text>
        <FormInput label="Sender Name" placeholder="Enter sender name" value={formData.sender.name} onChangeText={(t) => updateField("sender", "name", t)} />
        <FormInput label="Sender Phone" placeholder="Enter phone number" keyboardType="phone-pad" value={formData.sender.phone} onChangeText={(t) => updateField("sender", "phone", t)} />
        <FormInput label="Sender Address" placeholder="Enter address" value={formData.sender.address} onChangeText={(t) => updateField("sender", "address", t)} />
      </View>

      {/* Receiver Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Receiver Details</Text>
        <FormInput label="Recipient Name" placeholder="Enter recipient name" value={formData.receiver.name} onChangeText={(t) => updateField("receiver", "name", t)} />
        <FormInput label="Recipient Phone" placeholder="Enter phone number" keyboardType="phone-pad" value={formData.receiver.phone} onChangeText={(t) => updateField("receiver", "phone", t)} />
        <FormInput label="Recipient Address" placeholder="Enter address" value={formData.receiver.address} onChangeText={(t) => updateField("receiver", "address", t)} />
      </View>

      {/* Parcel Details */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text, marginBottom: 12 }}>Parcel Details</Text>
        <FormInput label="Weight (kg)" placeholder="Enter weight" keyboardType="numeric" value={formData.parcel.weight} onChangeText={(t) => updateField("parcel", "weight", t)} />
        <FormInput label="Price (KES)" placeholder="Enter price" keyboardType="numeric" value={formData.parcel.price} onChangeText={(t) => updateField("parcel", "price", t)} />
        <FormInput label="Special Instructions" placeholder="Any notes..." multiline onChangeText={(t) => setNotes(t)} />

        {/* Destination Selection */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 }}>Destination Type</Text>
        <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12, backgroundColor: colors.background }}>
          <Picker selectedValue={destination} onValueChange={(v) => setDestination(v)}>
            <Picker.Item label="Pickup" value="pickup" />
            <Picker.Item label="Drop-off" value="dropoff" />
          </Picker>
        </View>

        {destination === "pickup" && (
          <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 12, backgroundColor: colors.background }}>
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

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={selectedPrinterMac ? handleSubmit : () => setShowPrinterModal(true)}
        style={{
          backgroundColor: selectedPrinterMac ? colors.primary : colors.danger,
          padding: 16,
          borderRadius: 8,
          shadowOpacity: 0.2,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600", fontSize: 16 }}>
          {selectedPrinterMac ? "Generate QR Code" : "Select Printer"}
        </Text>
      </TouchableOpacity>

      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={(mac) => {
          setSelectedPrinterMac(mac);
          AsyncStorage.setItem("SELECTED_PRINTER_MAC", mac);
        }}
      />
    </ScrollView>
  );
}

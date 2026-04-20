import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FormInput } from '../components/input.component';
import { PrinterSelectionModal } from '../modals/printerSelect.model';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildReceiptText } from '../services /recieptBuilder';
import { buildQrPayload, printToPrinter } from '../services /printer.service';
export default function ParcelIntakeScreen() {
  const [destination, setDestination] = useState('pickup');
  const [pickup, setpickup] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(
    null,
  );
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  // const [msg, setMsg] = useState({ msg: "", state: "" });
  const [formData, setFormData] = useState({
    sender: {
      name: '',
      phone: '',
      address: '',
    },
    receiver: {
      name: '',
      phone: '',
      address: '',
    },
    parcel: {
      weight: '',
      instructions: '',
      destination: 'pickup',
      pickup: '',
      price: '',
    },
    printerMac: null,
  });
  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };
  const handleSubmit = async () => {
    // const invoiceId = `INV${Date.now().toString().slice(-6)}`;
    const receiptNo = 'await getNextReceiptNumber()';
    const receiptText = buildReceiptText({
      receiptNo,
      invoiceId: 'INV-001',
      sender: formData.sender,
      reciever: formData.receiver,
      parcel: formData.parcel,
      destination: destination,
      pickup: pickup,
      paid: Number(formData.parcel.price),
      paidCash: Number(formData.parcel.price),
      totals: {
        finalTotal: Number(formData.parcel.price),
      },
      user: { name: 'Admin' },
    });

    const qrData = JSON.stringify({
      id: receiptNo,
      phone: formData.receiver.phone,
    });

    await printToPrinter(selectedPrinterMac, receiptText, qrData, true);

    console.log('object', notes, formData);
  };
  return (
    <ScrollView className="flex-1 bg-gray-50 px-6 pb-24">
      {/* Sender Details */}
      <View className="bg-white rounded-xl shadow-md p-4 mb-6">
        <Text className="text-lg font-semibold mb-3 text-gray-800">
          Sender Details
        </Text>
        <FormInput
          label="Sender Name"
          placeholder="Enter sender name"
          value={formData.sender.name}
          onChangeText={text => updateField('sender', 'name', text)}
        />

        <FormInput
          label="Sender Phone"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={formData.sender.phone}
          onChangeText={text => updateField('sender', 'phone', text)}
        />
        <FormInput
          label="Sender Address"
          placeholder="Enter address"
          value={formData.sender.address}
          onChangeText={text => updateField('sender', 'address', text)}
        />
      </View>

      {/* Receiver Details */}
      <View className="bg-white rounded-xl shadow-md p-4 mb-6">
        <Text className="text-lg font-semibold mb-3 text-gray-800">
          Receiver Details
        </Text>
        <FormInput
          label="Recipient Name"
          placeholder="Enter recipient name"
          value={formData.receiver.name}
          onChangeText={text => updateField('receiver', 'name', text)}
        />
        <FormInput
          label="Recipient Phone"
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={formData.receiver.phone}
          onChangeText={text => updateField('receiver', 'phone', text)}
        />
        <FormInput
          label="Recipient Address"
          placeholder="Enter address"
          value={formData.receiver.address}
          onChangeText={text => updateField('receiver', 'address', text)}
        />
      </View>

      {/* Parcel Details */}
      <View className="bg-white rounded-xl shadow-md p-4 mb-6">
        <Text className="text-lg font-semibold mb-3 text-gray-800">
          Parcel Details
        </Text>
        <FormInput
          label="Weight (kg)"
          placeholder="Enter weight"
          keyboardType="numeric"
          value={formData.parcel.weight}
          onChangeText={text => updateField('parcel', 'weight', text)}
        />

        <FormInput
          label="Price (KES)"
          placeholder="Enter price"
          keyboardType="numeric"
          value={formData.parcel.price}
          onChangeText={text => updateField('parcel', 'price', text)}
        />
        <FormInput
          label="Special Instructions"
          placeholder="Any notes..."
          multiline
          onChangeText={text => setNotes(text)}
        />

        {/* Destination Selection */}
        <Text className="text-base font-semibold text-gray-700 mb-2">
          Destination Type
        </Text>
        <View className="border border-gray-300 rounded-lg mb-3 bg-white">
          <Picker
            selectedValue={destination}
            onValueChange={value => setDestination(value)}
          >
            <Picker.Item label="Pickup" value="pickup" />
            <Picker.Item label="Drop-off" value="dropoff" />
          </Picker>
        </View>
        {destination === 'pickup' && (
          <View className="border border-gray-300 rounded-lg mb-3 bg-white">
            <Picker
              selectedValue={pickup}
              onValueChange={value => setpickup(value)}
            >
              <Picker.Item
                label="Kitale(Hindu Temple)"
                value="Kitale(Hindu Temple)"
              />
              <Picker.Item
                label="Kitale(Miseum Point)"
                value="Kitale(Miseum Point)"
              />
              <Picker.Item
                label="Eldoret(Kiteleele Stop)"
                value="Eldoret(Kiteleele Stop)"
              />
              <Picker.Item
                label="Nairobi(Miseum Point)"
                value="Nairobi(Miseum Point)"
              />
              <Picker.Item label="Nairobi(Gikomba)" value="Nairobi(Gikomba)" />
              <Picker.Item
                label="Nairobi(Eastleigh)"
                value="Nairobi(Eastleigh)"
              />
            </Picker>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={
          selectedPrinterMac ? handleSubmit : () => setShowPrinterModal(true)
        }
        className={`${
          selectedPrinterMac ? 'bg-blue-600' : 'bg-red-600'
        } p-4 rounded-lg shadow-md`}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {selectedPrinterMac ? 'Generate QR Code' : 'Select Printer'}
        </Text>
      </TouchableOpacity>
      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={mac => {
          setSelectedPrinterMac(mac);
          AsyncStorage.setItem('SELECTED_PRINTER_MAC', mac);
        }}
      />
    </ScrollView>
  );
}

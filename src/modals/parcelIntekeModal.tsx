/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FormInput } from '../components/input.component';
import { PrinterSelectionModal } from '../modals/printerSelect.model';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/themeContext';
import { ParcelFormState } from '../../types';
import { buildReceiptText } from '../services /recieptBuilder';
import { printToPrinter } from '../services /printer.service';
import { useRegisterParcelMutation } from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';
import Toast from '../components/toast';
import { SectionHeader } from '../components/ui/sectionHeader';
import { COUNTRIES } from '../utils/countryCodes';
import { PhoneInput } from '../components/phoneinput';
import { PermissionsAndroid } from 'react-native';

export default function ParcelIntakeScreen({ onClose, refetch }: any) {
  const { colors } = useTheme();
  const [country, setCountry] = useState(COUNTRIES[0]);
  // State with strict types
  const { user } = useSelector((state: any) => state.auth);

  const [pickup, setPickup] = useState<any>('');
  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(
    null,
  );
  const pickups = useSelector((state: any) => state.pickups.pickups);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [postParcel, { isLoading: submitting }] = useRegisterParcelMutation();

  const [msg, setMsg] = useState({ msg: '', state: '' });
  const [formData, setFormData] = useState<ParcelFormState>({
    sender: { name: '', phone: '', address: '' },
    receiver: { name: '', phone: '', address: '' },
    parcel: {
      weight: '',
      instructions: '',
      destination: 'pickup',
      pickup,
      code: '',
      sentFrom: user.pickup?._id || '',
      price: '',
      fragile: false,
    },
  });

  // Load saved printer on mount
  useEffect(() => {
    const loadPrinter = async () => {
      const saved = await AsyncStorage.getItem('SELECTED_PRINTER_MAC');
      if (saved) setSelectedPrinterMac(saved);
    };
    loadPrinter();
  }, []);

  // Strictly typed update function
  const updateField = <
    K extends keyof ParcelFormState,
    F extends keyof ParcelFormState[K],
  >(
    section: K,
    field: F,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async () => {
    const sixDigitNumber = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    if (!selectedPrinterMac) {
      setShowPrinterModal(true);
      return;
    }
    const updatedFormData = {
      ...formData,
      parcel: {
        ...formData.parcel,
        pickup,
        code: `${
          pickups.filter((p: any) => p._id === pickup)[0].short_code
        }-${sixDigitNumber}`,
      },
    };

    try {
      const receiptNo = `INV${sixDigitNumber}`;
      await postParcel(updatedFormData).unwrap();
      // 1. Build Text Payload
      // 1. Build the Receipt Text
      const currentPickup = pickups.find((p: any) => p._id === pickup);
      const pickupShortCode = currentPickup?.short_code || '';
      const pickupFullName = currentPickup?.pickup_name || '';

      const receiptText = buildReceiptText({
        receiptNo,
        invoiceId: receiptNo,
        sender: formData.sender,
        reciever: formData.receiver,
        parcel: formData.parcel,
        sixDigitNumber,
        from: `${user?.pickup?.pickup_name || ''}`,
        pickupName: pickupFullName,
        paid: Number(formData.parcel.price) || 0,
        paidCash: Number(formData.parcel.price) || 0,
        totals: { finalTotal: Number(formData.parcel.price) || 0 },
        user: { name: 'Admin' },
      });

      // 2. Build QR Data (Stringified JSON for the bottom QR)
      const qrData = JSON.stringify({
        id: receiptNo,
        reciever: formData.receiver,
        pickupName: pickupFullName,
        code: `${pickupShortCode}-${sixDigitNumber}`,
        from: `${user?.pickup?.pickup_name || ''}`,
      });

      // 3. Print
      // Note: We added 'receiptNo' at the end to be used for the TOP BARCODE
      const success = await printToPrinter(
        selectedPrinterMac,
        pickupShortCode,
        receiptText,
        qrData,
        sixDigitNumber,

        true, // printQr
        receiptNo, // <--- This maps to barcodeData in your function
      );

      if (success) {
        await onClose();
        await refetch();
        setMsg({
          msg: 'Parcel registered and receipt printed successfully',
          state: 'success',
        });
      }
    } catch (error: any) {
      console.log(error);
      setMsg({
        msg: error?.data?.message || 'An unknown error occurred',
        state: 'error',
      });
    }
  };
  const requestBluetoothPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const scanGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;

      const connectGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return scanGranted && connectGranted;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };
  useEffect(() => {
    const initLocation = async () => {
      try {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
          console.log('❌ Location permission denied');
          return;
        }
      } catch (err) {
        console.log('🔥 Location error:', err);
      }
    };

    initLocation();
  }, []);
  useEffect(() => {
 
  const init = async () => {
    const hasPermission = await requestBluetoothPermissions();

    if (!hasPermission) {
      console.log("❌ Bluetooth permission denied");
      return;
    }

    console.log("✅ Bluetooth permission granted");

    // 👉 Start scanning for printers here
    
  };

  init();
}, []);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 96,
        paddingTop: 20,
      }}
    >
      {' '}
      <SectionHeader title="New parcel" />
      {/* Sender Details */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Sender Details
        </Text>
        <FormInput
          label="Sender Name"
          value={formData.sender.name}
          onChangeText={t => updateField('sender', 'name', t)}
        />
        <PhoneInput
          label="Sender Phone"
          value={formData.sender.phone}
          country={country}
          onChangeCountry={setCountry}
          onChange={t => updateField('sender', 'phone', t)}
        />
      </View>
      {/* Receiver Details */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Receiver Details
        </Text>
        <FormInput
          label="Recipient Name"
          value={formData.receiver.name}
          onChangeText={t => updateField('receiver', 'name', t)}
        />
        <PhoneInput
          label="Recipient Phone"
          value={formData.receiver.phone}
          country={country}
          onChangeCountry={setCountry}
          onChange={t => updateField('receiver', 'phone', t)}
        />
      </View>
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
      {/* Parcel Details */}
      <View
        style={{
          backgroundColor: formData.parcel.fragile
            ? colors.background
            : colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
          // className="flex flex-row align-items-center justify-content-space-between bg-red-300 w-full  px-1"
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            Parcel Details
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>Fragile</Text>

            <Switch
              value={formData.parcel.fragile}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  parcel: { ...prev.parcel, fragile: value },
                }))
              }
              trackColor={{ false: '#ccc', true: colors.primary }}
              thumbColor={formData.parcel.fragile ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <FormInput
          label="Weight (kg)"
          keyboardType="numeric"
          value={formData.parcel.weight}
          onChangeText={t => updateField('parcel', 'weight', t)}
        />
        <FormInput
          label="Price (KES)"
          keyboardType="numeric"
          value={formData.parcel.price}
          onChangeText={t => updateField('parcel', 'price', t)}
        />
        <FormInput
          label="Special Instructions"
          multiline
          value={formData.parcel.instructions}
          onChangeText={t => updateField('parcel', 'instructions', t)}
        />

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
          }}
        >
          <Picker selectedValue={pickup} onValueChange={v => setPickup(v)}>
            {pickups
              ?.filter((pickup: any) => pickup._id !== user.pickup?._id)
              .map((pickup: any) => (
                <Picker.Item label={pickup.pickup_name} value={pickup._id} />
              ))}
          </Picker>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: selectedPrinterMac ? colors.primary : colors.error,
          padding: 16,
          borderRadius: 8,
        }}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}
          >
            {selectedPrinterMac
              ? 'Generate & Print Receipt'
              : 'Select Printer First'}
          </Text>
        )}
      </TouchableOpacity>
      {/* <PrimaryButton title="Login" onPress={handleLogin} loading={loading} /> */}
      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={mac => {
          setSelectedPrinterMac(mac);
          AsyncStorage.setItem('SELECTED_PRINTER_MAC', mac);
          setShowPrinterModal(false);
        }}
      />
    </ScrollView>
  );
}

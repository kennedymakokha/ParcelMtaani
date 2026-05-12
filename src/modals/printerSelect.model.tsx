import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface PrinterModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mac: string) => void;
}

export const PrinterSelectionModal = ({
  visible,
  onClose,
  onSelect,
}: PrinterModalProps) => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);

  const scanDevices = async () => {
    setLoading(true);
    try {
      const paired = await RNBluetoothClassic.getBondedDevices();
      const unpaired = await RNBluetoothClassic.startDiscovery();
      const all = [...paired, ...unpaired];
      const unique = all.filter(
        (v, i, a) => a.findIndex(t => t.address === v.address) === i,
      );
      setDevices(unique);
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        'Connection Error',
        'Please ensure Bluetooth and Location services are enabled.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) scanDevices();
    return () => {
      if (visible) RNBluetoothClassic.cancelDiscovery();
    };
  }, [visible]);

  const handleSelect = async (device: BluetoothDevice) => {
    await AsyncStorage.setItem('SELECTED_PRINTER_MAC', device.address);
    onSelect(device.address);
    onClose();
  };

  const renderDeviceItem = ({ item }: { item: BluetoothDevice }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      className="flex-row items-center p-4 rounded-xl mb-3 border border-gray-300 bg-white active:opacity-70"
    >
      <View className="w-12 h-12 rounded-lg justify-center items-center bg-blue-100">
        <Ionicons name="print-outline" size={22} color="#2563eb" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-gray-800">
          {item.name || 'Unknown Printer'}
        </Text>
        <Text className="text-xs text-gray-500">{item.address}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <TouchableOpacity
          className="flex-1"
          onPress={onClose}
          activeOpacity={1}
        />

        <View className="rounded-t-3xl bg-white px-5 pt-3 pb-8 h-[70%]">
          {/* Drag Handle */}
          <View className="w-10 h-1.5 rounded-full bg-gray-300 self-center mb-5" />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Available Printers
              </Text>
              <Text className="text-sm text-gray-500">
                Select a bluetooth thermal printer
              </Text>
            </View>
            {loading && <ActivityIndicator color="#2563eb" />}
          </View>

          {/* Device List */}
          <FlatList
            data={devices}
            keyExtractor={item => item.address}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              !loading ? (
                <View className="items-center justify-center mt-16">
                  <Ionicons
                    name="bluetooth-outline"
                    size={48}
                    color="#9ca3af"
                  />
                  <Text className="text-gray-500 mt-3">No devices found</Text>
                </View>
              ) : null
            }
            renderItem={renderDeviceItem}
          />

          {/* Footer */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 h-12 rounded-lg border border-gray-300 bg-gray-100 justify-center items-center"
            >
              <Text className="text-gray-800 font-bold">Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={scanDevices}
              disabled={loading}
              className="flex-1 h-12 rounded-lg bg-blue-600 flex-row justify-center items-center"
            >
              <Ionicons
                name="refresh"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white font-bold">Rescan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

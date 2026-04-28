/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { scanQRCode } from '../../modules/react-native-qr-scanner/src';
import { useTheme } from '../contexts/themeContext';
import {
  useFetchparcelQuery,
  useMarkParcelAsrrivedMutation,
} from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';
import Toast from '../components/toast';
import { PrimaryButton } from '../components/PrimaryButton';
import Signature from 'react-native-signature-canvas';

export default function ScannerScreen() {
  const { colors } = useTheme();
 
  const currentPickup = useSelector((state: any) => state.pickups.currentPickup);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [allParcels, setAllParcels] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [msg, setMsg] = useState({ msg: '', state: '' });

  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const { data, isFetching, refetch } = useFetchparcelQuery({
    limit: 10,
    sentTo: currentPickup,
    page,
    status: 'Pending Collection',
    search,
  });

  const [handleArrival] = useMarkParcelAsrrivedMutation();

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!data?.parcels) return;
    if (page === 1) {
      setAllParcels(data.parcels);
    } else {
      setAllParcels(prev => {
        const ids = new Set(prev.map(p => p._id));
        const newItems = data.parcels.filter((p: any) => !ids.has(p._id));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (!isFetching && page < (data?.totalPages || 1)) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, page, data?.totalPages]);

  const handleScan = async () => {
    try {
      const result: any = await scanQRCode();
      const parsed = JSON.parse(result);
      await handleArrival(parsed).unwrap();
      await refetch();
    } catch (err: any) {
      setMsg({ msg: err?.data?.message || 'Scan failed', state: 'error' });
    }
  };

  const openParcel = (item: any) => {
    setSelectedParcel(item);
    setModalVisible(true);
  };

  const renderParcel = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => openParcel(item)}
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontWeight: '600', color: colors.text }}>
        From: {item.sentFrom?.pickup_name}
      </Text>
      <Text style={{ color: colors.secondary }}>
        Pickup: {item.pickup?.pickup_name}
      </Text>
      <Text style={{ color: colors.primary, marginTop: 4 }}>
        Code: {item.code}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontWeight: '600',
          color:
            item.status === 'Delivered'
              ? colors.success
              : item.status === 'In Transit'
              ? colors.warning
              : colors.error,
        }}
      >
        Status: {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 🔍 Search */}
      <TextInput
        placeholder="Search parcels..."
        value={search}
        onChangeText={setSearch}
        style={{
          margin: 16,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 10,
          color: colors.text,
        }}
        placeholderTextColor={colors.secondary}
      />

      {/* 📦 List */}
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        data={allParcels}
        keyExtractor={item => item._id}
        renderItem={renderParcel}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.secondary }}>
            No parcels found
          </Text>
        }
      />

      {/* 🖊️ Signature Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            Confirm Pickup
          </Text>
          <Text style={{ marginTop: 10, color: colors.secondary }}>
            Parcel: {selectedParcel?.code}
          </Text>

          {/* Signature Pad */}
          <View style={{ flex: 1, marginVertical: 20 }}>
            <Signature
              onOK={(sig) => setSignatureData(sig)}
              onEmpty={() => setMsg({ msg: "No signature captured", state: "error" })}
              descriptionText="Sign to confirm pickup"
              clearText="Clear"
              confirmText="Save"
              webStyle={`
                .m-signature-pad--footer { display: none; }
                .m-signature-pad { border: 1px solid ${colors.border}; }
                .m-signature-pad--body { background: ${colors.card}; }
              `}
            />
          </View>

          <PrimaryButton
            onPress={() => {
              if (signatureData) {
                // TODO: send signatureData to backend with parcel info
                setModalVisible(false);
                setMsg({ msg: "Pickup confirmed", state: "success" });
              } else {
                setMsg({ msg: "Signature required", state: "error" });
              }
            }}
            title="Confirm Pickup"
          />
        </View>
      </Modal>

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}

      {/* ➕ Scan Button */}
      <TouchableOpacity
        onPress={handleScan}
        style={{
          position: 'absolute',
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
        <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>Scan New</Text>
      </TouchableOpacity>
    </View>
  );
}

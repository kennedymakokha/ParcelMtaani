/* eslint-disable react-native/no-inline-styles */
import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, TextInput } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import {
  useFetchparcelQuery,
  useMarkParcerAsDeliveredMutation,
} from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';
import Toast from '../components/toast';
import { useSocket } from '../contexts/socketContext';
import { useFocusEffect } from '@react-navigation/native';
import { ParcelCard } from '../components/parcekCard';
import { ParcelCollectionModal } from '../modals/ParcelCollection.model';

export default function ScannerScreen() {
  const { colors } = useTheme();
  const signatureRef = useRef<any>(null);
 
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [allParcels, setAllParcels] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    reciever_signature: '',
    reciever_ID: '',
  });
  const { user } = useSelector((state: any) => state.auth);
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const { socket } = useSocket();
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const { data, isFetching, refetch } = useFetchparcelQuery({
    limit: 10,
    sentFrom: user?.pickup?._id,
    page,
    status: 'Cancelled',
    search,
  });

  const [handleCollected, { isLoading: collectionLoading }] =
    useMarkParcerAsDeliveredMutation();

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
  useEffect(() => {
    if (!socket) return;

    const onCanceledParcel = async (parcel: any) => {
      console.log(parcel);
      //

      await refetch();
    };

    socket.on('Parcel-change', onCanceledParcel);
    return () => {
      socket.off('Parcel-change', onCanceledParcel);
    };
  }, [socket, refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
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

  const handleConfirmPickup = async () => {
    if (!signatureData) {
      setMsg({ msg: 'Please provide a signature', state: 'error' });
      return;
    }
    try {
      await handleCollected({
        id: selectedParcel._id,
        reciever_signature: signatureData,
        reciever_ID: formData.reciever_ID,
      }).unwrap();
      setMsg({ msg: 'Pickup confirmed', state: 'success' });
      setModalVisible(false);
      setSelectedParcel(null);
      setFormData({ reciever_signature: '', reciever_ID: '' });
      await refetch();
    } catch (err: any) {
      console.log(err);
      setMsg({
        msg: err?.data?.message || 'Confirmation failed',
        state: 'error',
      });
    }
  };

  const openParcel = (item: any) => {
    setSelectedParcel(item);
    setModalVisible(true);
  };

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
        renderItem={({ item }: { item: any }) => (
          <ParcelCard
            item={item}
            onPress={() => openParcel(item)}
            colors={colors}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.secondary }}>
            No parcels found
          </Text>
        }
      />

      <ParcelCollectionModal
        modalVisible={modalVisible}
        selectedParcel={selectedParcel}
        formData={formData}
        setFormData={setFormData}
        signatureRef={signatureRef}
        setSignatureData={setSignatureData}
        colors={colors}
        handleConfirmPickup={handleConfirmPickup}
        collectionLoading={collectionLoading}
        setMsg={setMsg}
      />

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
    </View>
  );
}

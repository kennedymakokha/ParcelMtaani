/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useCreatePickupMutation,
  useDeletePickupMutation,
  useEditPickupMutation,
  useGetPickupsQuery,
} from '../services/apis/pickup.api';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { FormInput } from '../components/input.component';
import PickupSkeleton from '../components/skeletons/pickupSkeleton';

export default function PickupManagementScreen() {
  const { colors } = useTheme();

  // Pagination state
  const [page, setPage] = useState(1);
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const { data, isFetching, refetch } = useGetPickupsQuery({
    page,
    limit: 10,
    search: '',
  });
  const [createPickup, { isLoading }] = useCreatePickupMutation();
  const [updatePickup] = useEditPickupMutation();
  const [deletePickup] = useDeletePickupMutation();

  // UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPickup, setEditingPickup] = useState<any>(null);

  // Form state
  const [pickupName, setPickupName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [state, setState] = useState('inactive');
  const isInitialLoading = isFetching && page === 1 && allPickups.length === 0;
  /** ✅ Merge data for pagination */
  useEffect(() => {
    if (!data?.pickups) return;
    if (page === 1) {
      setAllPickups(data.pickups);
    } else {
      setAllPickups(prev => {
        const ids = new Set(prev.map(p => p._id));
        const newItems = data.pickups.filter((p: any) => !ids.has(p._id));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  /** ✅ Pull to refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  /** ✅ Infinite scroll */
  const loadMore = useCallback(() => {
    if (!isFetching && page < (data?.totalPages || 1)) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, page, data?.totalPages]);

  // Open modal
  const openModal = (pickup?: any) => {
    if (pickup) {
      setEditingPickup(pickup);
      setPickupName(pickup.pickup_name);
      setPhoneNumber(pickup.phone_number || '');
      setShortCode(pickup.short_code || '');
      setState(pickup.state || 'inactive');
      setContactNumber(pickup.contact_number || 'inactive');
    } else {
      setEditingPickup(null);
      setPickupName('');
      setPhoneNumber('');
      setShortCode('');
      setState('inactive');
    }
    setModalVisible(true);
  };

  // Save pickup
  const savePickup = async () => {
    const payload = {
      pickup_name: pickupName,
      phone_number: phoneNumber,
      short_code: shortCode,
      contact_number: contactNumber,
      state,
    };

    if (editingPickup) {
      await updatePickup({ id: editingPickup._id, ...payload });
    } else {
      await createPickup(payload);
    }
    setModalVisible(false);
    setPage(1);
    refetch();
  };

  // Delete pickup
  const removePickup = async (id: string) => {
    await deletePickup(id);
    setPage(1);
    refetch();
  };

  // Render pickup card
  const renderPickup = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {item.pickup_name}
      </Text>
      <Text style={{ color: colors.secondary }}>
        Phone: {item.phone_number || 'N/A'}
      </Text>
      <Text style={{ color: colors.primary }}>
        Code: {item.short_code || 'N/A'}
      </Text>
      <Text
        style={{
          color: item.state === 'active' ? colors.success : colors.error,
        }}
      >
        Status: {item.state}
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => openModal(item)}
          style={[styles.button]}
        >
          <Ionicons name="create-outline" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removePickup(item._id)}
          style={[styles.button]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <View
        style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}
      >
        {isInitialLoading ? (
          <PickupSkeleton />
        ) : (
          <FlatList
            data={allPickups}
            keyExtractor={item => item._id}
            renderItem={renderPickup}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching && page > 1 ? (
                <Text style={{ textAlign: 'center', padding: 10 }}>
                  Loading more...
                </Text>
              ) : null
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', color: colors.secondary }}>
                No pickups found
              </Text>
            }
          />
        )}
      </View>

      {/* Floating Add Button */}

      <TouchableOpacity
        onPress={() => openModal()}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: colors.primary,
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderRadius: 50,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 20 }}>
          ＋
        </Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View
          style={{ flex: 1, padding: 20, backgroundColor: colors.background }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
            {editingPickup ? 'Edit Pickup' : 'Add Pickup'}
          </Text>

          <FormInput
            label="Pickup Name"
            placeholder="Pickup Name"
            value={pickupName}
            onChangeText={setPickupName}
          />
          <FormInput
            label="Phone Number"
            placeholder="712 345 678"
            keyboardType="phone-pad"
            withCountryCode
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <FormInput
            label="Short Code"
            placeholder="Short Code"
            value={shortCode}
            onChangeText={setShortCode}
          />
          <FormInput
            label="Contact Person's Number"
            placeholder="712 345 678"
            keyboardType="phone-pad"
            withCountryCode
            value={contactNumber}
            onChangeText={setContactNumber}
          />

          <PrimaryButton
            title={editingPickup ? 'Update' : 'Create'}
            onPress={savePickup}
            loading={isLoading}
          />
          <SecondaryButton
            onPress={() => setModalVisible(false)}
            title="Cancel"
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderColor: '#ffffff',
  },
});

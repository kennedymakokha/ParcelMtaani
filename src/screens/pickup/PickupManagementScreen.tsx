/* eslint-disable react-native/no-inline-styles */
import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import {
  useCreatePickupMutation,
  useTrashPickupMutation,
  useUpdatePickupMutation,
  useFetchPickupsQuery,
} from '../../services/apis/pickup.api';
import PickupSkeleton from '../../components/skeletons/pickupSkeleton';
import { ActionButton } from '../../components/buttons/actionButtons';
import { AddPickupModal } from './addPickupModal';
import Toast from '../../components/toast';
import ConfirmDeleteModal from '../../components/modals/confirmDelete';

export default function PickupManagementScreen() {
  const { colors } = useTheme();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Pagination state
  const [page, setPage] = useState(1);
  const [allPickups, setAllPickups] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const { data, isFetching, refetch } = useFetchPickupsQuery({
    page,
    limit: 10,
    search: '',
  });
  const [createPickup, { isLoading }] = useCreatePickupMutation();
  const [updatePickup, { isLoading: editing }] = useUpdatePickupMutation();
  const [deletePickup, { isLoading: deleting }] = useTrashPickupMutation();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  // UI state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPickup, setEditingPickup] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      await refetch();
      setMsg({ msg: 'Pickup Updated successfully', state: 'success' });
    } else {
      await createPickup(payload);
      setMsg({ msg: 'Pickup Created successfully', state: 'success' });
      await refetch();
    }
    setModalVisible(false);
    setPage(1);
    refetch();
  };

  // Delete pickup

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await deletePickup(selectedId).unwrap();
      await refetch();
      setMsg({ msg: 'Pickup deleted successfully', state: 'success' });
      setShowDeleteModal(false);
      setPage(1); // ✅ single refresh
    } catch (err: any) {
      setMsg({
        msg: err.message || err.data?.message || 'Error occurred, try again ',
        state: 'error',
      });
    }
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
        <ActionButton
          title="Edit"
          type="primary"
          onPress={() => openModal(item)}
        />
        <ActionButton
          title="Delete"
          type="error"
          onPress={() => {
            setSelectedId(item._id);
            setShowDeleteModal(true);
          }}
        />
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
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
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
      <ConfirmDeleteModal
        visible={showDeleteModal}
        onConfirm={handleDelete}
        loading={deleting }
        onCancel={() => setShowDeleteModal(false)}
      />
      {/* Add/Edit Modal */}
      <AddPickupModal
        modalVisible={modalVisible}
        editingPickup={editingPickup}
        pickupName={pickupName}
        setPickupName={setPickupName}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        shortCode={shortCode}
        setShortCode={setShortCode}
        contactNumber={contactNumber}
        setContactNumber={setContactNumber}
        savePickup={savePickup}
        isLoading={editingPickup ? editing : isLoading}
        setModalVisible={() => {
          setContactNumber('');
          setPhoneNumber('');
          setPickupName('');
          setShortCode('');
          setModalVisible(false);
        }}
      />
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

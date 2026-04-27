/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import TruckFormModal from '../components/modals/truckManagement';
import { useDeleteTruckMutation, useGetTrucksQuery } from '../services/apis/trucks.api';
import ConfirmModal from '../components/modals/confirmDelete';

interface Truck {
  _id: string;
  plate: string;
  model: string;
  capacity: string;
  driverId?: string;
}

export default function TrucksManagementScreen() {
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const [allTrucks, setAllTrucks] = useState<Truck[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const  [deleteTruckMutation,{isLoading: isDeleting}] = useDeleteTruckMutation();
  const { data, isFetching, isLoading, refetch } = useGetTrucksQuery({
    page,
    limit: 10,
    search,
  });

  const [item, setItem] = useState<any>({
    plate: '',
    model: '',
    capacity: '',
    driverId: '',
  });

  const openModal = (truck?: Truck) => {
    console.log(truck);
    if (truck) {
      setEditingTruck(truck);
      setItem({
        plate: truck.plate,
        model: truck.model,
        capacity: truck.capacity,
        driverId: truck.driverId || '',
      });
    } else {
      setEditingTruck(null);
      setItem({
        plate: '',
        model: '',
        capacity: '',
        driverId: '',
      });
    }
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedTruckId) return;

    try {
      await deleteTruckMutation(selectedTruckId).unwrap();
      setShowDeleteModal(false);
      setSelectedTruckId(null);
    
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const renderTruck = ({ item }: { item: Truck }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOpacity: 0.1,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
        Plate: {item.plate}
      </Text>
      <Text style={{ color: colors.secondary, marginTop: 4 }}>
        Model: {item.model}
      </Text>
      <Text style={{ color: colors.primary, marginTop: 4 }}>
        Capacity: {item.capacity}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => openModal(item)}
          style={{
            backgroundColor: colors.primary,
            padding: 10,
            borderRadius: 8,
            marginRight: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedTruckId(item._id);
            setShowDeleteModal(true);
          }}
          style={{
            backgroundColor: colors.error,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  useEffect(() => {
    if (data?.trucks) {
      if (page === 1) {
        setAllTrucks(data.trucks);
      } else {
        setAllTrucks(prev => [...prev, ...data.trucks]);
      }

      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);
  useEffect(() => {
    setPage(1);
  }, [search]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
    

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
        placeholder="Search trucks..."
        placeholderTextColor={colors.secondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Truck List */}
      <FlatList
        data={allTrucks}
        keyExtractor={(item: Truck) => item._id}
        renderItem={renderTruck}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        refreshing={isLoading && page === 1}
        ListFooterComponent={
          isFetching ? (
            <Text style={{ textAlign: 'center', margin: 10 }}>Loading...</Text>
          ) : null
        }
        ListEmptyComponent={
          <Text style={{ color: colors.secondary, textAlign: 'center' }}>
            No trucks found
          </Text>
        }
      />

      {/* Floating Action Button */}
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

      <TruckFormModal
        visible={showModal}
        onClose={async () => {
          setShowModal(false);
          await refetch();
          setItem({
            plate: '',
            model: '',
            capacity: '',
            driverId: '',
          });
        }}
        item={item}
        setItem={setItem}
        editingTruck={editingTruck || undefined}
      />
      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Truck"
        message="This will remove the truck permanently."
        onConfirm={handleDelete}
        loading={isDeleting}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

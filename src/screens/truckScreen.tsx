/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import {
  View,
  Text,

  FlatList,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import TruckFormModal from '../components/modals/truckManagement';
import {
  useDeleteTruckMutation,
  useGetTrucksQuery,
} from '../services/apis/trucks.api';
import ConfirmModal from '../components/modals/confirmDelete';
import { Truck } from '../../types';
import { SearchBar } from '../components/ui/SearchBar';
import { Fab } from '../components/buttons/fab';
import { ActionButton } from '../components/buttons/actionButtons';

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
  const [deleteTruckMutation, { isLoading: isDeleting }] =
    useDeleteTruckMutation();
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
  driverPhone: '',
  driverIdNo: '',
});

  const openModal = (truck?: Truck) => {
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
        <ActionButton
          title="Edit"
          type="primary"
          onPress={() => openModal(item)}
        />
        <ActionButton
          title="Delete"
          type="error"
          onPress={() => {
            setSelectedTruckId(item._id);
            setShowDeleteModal(true);
          }}
        />
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
      setAllTrucks(prev => {
        const merged = page === 1 ? data.trucks : [...prev, ...data.trucks];

        const unique = merged.filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t._id === item._id),
        );

        return unique;
      });

      setHasMore(data.page < data.totalPages);
    }
  }, [data, page]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* Search Bar */}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch('')}
        placeholder="Search Fleet..."
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

      <Fab onPress={() => openModal()} />
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

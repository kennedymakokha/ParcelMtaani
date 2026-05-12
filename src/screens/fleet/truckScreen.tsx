/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import TruckFormModal from './fleetAddModal';
import {
  useDeleteTruckMutation,
  useGetTrucksQuery,
} from '../../services/apis/trucks.api';
import ConfirmModal from '../../components/modals/confirmDelete';

import { SearchBar } from '../../components/ui/SearchBar';
import { Fab } from '../../components/buttons/fab';
import { ActionButton } from '../../components/buttons/actionButtons';
import { Truck } from '../../../types';
import { SectionHeader } from '../../components/ui/sectionHeader';
import TruckCardSkeleton from './cardLoader';

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
      await refetch();
      setShowDeleteModal(false);
      setSelectedTruckId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const renderTruck = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOpacity: 0.1,
      }}
    >
      <SectionHeader title={item.plate} />

      <Text style={{ color: colors.secondary, marginTop: 6 }}>
        Model: {item.model}
      </Text>

      <Text style={{ color: colors.primary, marginTop: 6 }}>
        Capacity: {item.capacity}
      </Text>

      {/* DRIVER INFO */}
      <View
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <SectionHeader title="Driver Details" />

        <Text style={{ color: colors.secondary }}>
          Name: {item.driverId?.name || item.driver?.name || 'Not assigned'}
        </Text>

        <Text style={{ color: colors.secondary, marginTop: 2 }}>
          Phone:{' '}
          {item.driverId?.phone_number || item.driver?.phone_number || '-'}
        </Text>

        <Text style={{ color: colors.secondary, marginTop: 2 }}>
          ID No:{' '}
          {item.driverId?.identification_No ||
            item.driver?.identification_No ||
            '-'}
        </Text>

        {/* STATUS */}
        <Text
          style={{
            marginTop: 6,
            color: item.driverId ? 'green' : 'orange',
            fontWeight: '600',
          }}
        >
          {item.driverId ? 'Driver Assigned' : 'No Driver Assigned'}
        </Text>
      </View>

      {/* ACTIONS */}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 12,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 10 }}>
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
      {/* Truck List */}
      {(isLoading && page === 1) || isFetching ? (
        <View>
          {Array.from({ length: 5 }).map((_, i) => (
            <TruckCardSkeleton key={i} />
          ))}
        </View>
      ) : (
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
              <Text
                style={{
                  textAlign: 'center',
                  margin: 10,
                  color: colors.secondary,
                }}
              >
                Loading...
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <Text
              style={{
                color: colors.secondary,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              No trucks found
            </Text>
          }
        />
      )}

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

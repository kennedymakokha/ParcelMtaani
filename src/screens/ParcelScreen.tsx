/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import {
  useFetchgroupedparcelQuery,
  useFetchStatusCountQuery,
  useFetchTruckCountQuery,
} from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import FilterChipsFDB from '../components/horizontalScrollerFromDb';
import { useSocket } from '../contexts/socketContext';

export default function ParcelScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allParcels, setAllParcels] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('');
  const [selectedTruck, setSelectedTruck] = useState<string | null>('');
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const { user } = useSelector((state: any) => state.auth);
  /** Fetch filters */
  const { data: trucksData } = useFetchTruckCountQuery({});
  const trucks = trucksData?.data || [];
  const { socket } = useSocket();
  const { data: statesData } = useFetchStatusCountQuery({});
  const statusData = statesData?.data || [];

  /** Main query */
  const { data, isLoading, refetch, isFetching } = useFetchgroupedparcelQuery({
    limit: 10,
    pickupId: user?.pickup?._id,
    currentTruck: selectedTruck,
    page,
    status: selectedStatus,
    search,
  });
 
  /** ✅ Reset page when filters/search change */
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedTruck, search]);

  /** ✅ Handle data updates safely */
  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      setAllParcels(data.data);
    } else {
      // prevent duplicates (important for pagination)
      setAllParcels(prev => {
        const existingIds = new Set(prev.map(item => item._id));
        const newItems = data.data.filter(
          (item: any) => !existingIds.has(item._id),
        );
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
  /** ✅ Pull to refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // force fresh data
    setRefreshing(false);
  }, [refetch]);

  /** ✅ Load more */
  const loadMore = useCallback(() => {
    if (!isFetching && page < (data?.totalPages || 1)) {
      setPage(prev => prev + 1);
    }
  }, [isFetching, page, data?.totalPages]);
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

  /** ✅ Render parcel */
  const renderParcel = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ParcelDetails', { parcel: item })}
        style={{
          backgroundColor: colors.card,
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View>
          <Text style={{ fontWeight: '600', color: colors.text }}>
            Sender: {item.sender_name}
          </Text>

          <Text style={{ color: colors.secondary }}>
            Receiver: {item.receiver_name}
          </Text>

          <Text style={{ color: colors.primary, marginTop: 4 }}>
            Code: {item.code}
          </Text>

          <Text
            style={{
              marginTop: 6,
              fontWeight: '600',
              color:
                item.status === 'Collected'
                  ? colors.success
                  : item.status === 'In Transit'
                  ? colors.warning
                  : colors.danger,
            }}
          >
            Status: {item.status}
          </Text>
          {item.currentTruck?.plate && (
            <Text style={{ marginTop: 4, color: colors.secondary }}>
              Truck: {item.currentTruck.plate}
            </Text>
          )}
        </View>
        <View>
          <Ionicons
            name={
              item.sentFrom === currentPickup
                ? 'arrow-up-outline'
                : 'arrow-down-outline'
            }
            size={22}
            color={colors.secondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* Filters */}
      <View style={{ marginBottom: 12 }}>
        <FilterChipsFDB
          data={statusData}
          selectedId={selectedStatus}
          onSelect={(id: any) => setSelectedStatus(id)}
          idExtractor={(item: any) => item._id}
          labelExtractor={(item: any) => item.name}
          countExtractor={item => item.count}
        />

        {selectedStatus === 'In Transit' ? (
          <FilterChipsFDB
            data={trucks}
            selectedId={selectedTruck}
            onSelect={(id: any) => setSelectedTruck(id)}
            idExtractor={(item: any) => item.truck_id}
            labelExtractor={(item: any) => item.name}
            countExtractor={item => item.count}
          />
        ) : (
          <TextInput
            placeholder="Search parcels..."
            value={search}
            onChangeText={text => setSearch(text)}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
              color: colors.text,
            }}
          />
        )}
      </View>

      {/* List */}
      <FlatList
        data={allParcels}
        keyExtractor={item => item._id}
        renderItem={renderParcel}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={{ textAlign: 'center', color: colors.secondary }}>
              No parcels found
            </Text>
          ) : null
        }
      />
    </View>
  );
}

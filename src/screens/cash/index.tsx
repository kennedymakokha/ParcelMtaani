/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFetchpaymentsQuery } from '../../services/apis/mpesa.api.ts';
import { useTheme } from '../../contexts/themeContext';
import FilterChipsFDB from '../../components/horizontalScrollerFromDb.tsx';

type ParcelItem = {
  _id: string;
  code: string;
  weight: number;
  amount: number;
  method: string;
  from?: string;
  to?: string;
};

const LIMIT = 20;

const ParcelCashScreen = () => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setfilter] = useState<string | null>('today');
  const { data, isLoading, isFetching, refetch } = useFetchpaymentsQuery({
    page,
    limit: LIMIT,
    filter,
  });

  const parcels = data?.data || [];
  const pagination = data?.pagination;

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!isFetching && pagination?.page < pagination?.totalPages) {
      setPage(prev => prev + 1);
    }
  };
  const SkeletonCard = () => {
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-200 animate-pulse">
        <View className="flex-row justify-between items-center">
          <View className="h-4 w-24 bg-gray-200 rounded-md" />
          <View className="h-7 w-20 bg-gray-200 rounded-full" />
        </View>

        <View className="flex-row items-center mt-5">
          <View className="h-4 w-12 bg-gray-200 rounded-md" />
          <View className="h-4 w-6 mx-2 bg-gray-200 rounded-md" />
          <View className="h-4 w-12 bg-gray-200 rounded-md" />
        </View>

        <View className="flex-row justify-between mt-6">
          <View>
            <View className="h-3 w-14 bg-gray-200 rounded-md mb-2" />
            <View className="h-5 w-20 bg-gray-200 rounded-md" />
          </View>

          <View>
            <View className="h-3 w-14 bg-gray-200 rounded-md mb-2" />
            <View className="h-5 w-24 bg-gray-200 rounded-md" />
          </View>
        </View>
      </View>
    );
  };
  const renderItem = ({ item }: { item: ParcelItem }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Top */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
          {item.code}
        </Text>

        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor:
              item.method === 'CASH' ? colors.warning : colors.primaryLight,
          }}
        >
          <Text
            style={{
              fontWeight: '700',
              color: item.method !== 'CASH' ? colors.warning : colors.primary,
            }}
          >
            {item.method}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
      >
        <Text
          style={{ color: colors.success, fontWeight: '700', fontSize: 15 }}
        >
          {item.from || '---'}
        </Text>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={colors.subText}
          style={{ marginHorizontal: 8 }}
        />
        <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 15 }}>
          {item.to || '---'}
        </Text>
      </View>

      {/* Bottom */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 16,
        }}
      >
        <View>
          <Text style={{ color: colors.subText, fontSize: 12 }}>Weight</Text>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18 }}>
            {item.weight} KG
          </Text>
        </View>
        <View>
          <Text style={{ color: colors.subText, fontSize: 12 }}>Cash</Text>
          <Text
            style={{ color: colors.success, fontWeight: '700', fontSize: 18 }}
          >
            KES {item.amount}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        {[...Array(6)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}

      {/* List */}
      <FlatList
        data={parcels}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListHeaderComponent={
          <FilterChipsFDB
            data={[
              {
                title: 'today',
                labal: 'today',
              },
              {
                title: 'week',
                labal: 'week',
              },
              {
                title: 'month',
                labal: 'month',
              },
              {
                title: 'year',
                labal: 'year',
              },
            ]}
            selectedId={filter}
            onSelect={(id: any) => setfilter(id)}
            idExtractor={(item: any) => item.labal}
            labelExtractor={(item: any) => item.title}
          />
        }
        contentContainerStyle={{ padding: 16 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          isFetching ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ marginTop: 100, alignItems: 'center' }}>
            <Ionicons name="cube-outline" size={60} color={colors.subText} />
            <Text
              style={{ marginTop: 12, color: colors.subText, fontSize: 15 }}
            >
              No parcels found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ParcelCashScreen;

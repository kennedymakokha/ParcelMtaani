/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useTheme } from './../../contexts/themeContext';
import { useSocket } from './../../contexts/socketContext';
import RadialFab from './../../components/buttons/radialFab';
import SingleBarChart from './../../components/analytics/barChart';
import {
  useGetBusinessByIdQuery,
  useGetBusinessesQuery,
} from '../../services/apis/business.api';
import { formatNumber } from '../../utils/trancateText.ts';
import { SectionHeader } from '../../components/ui/sectionHeader.tsx';

type FilterType = 'today' | 'week' | 'month' | 'year';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { socket } = useSocket();

  const [filter, setFilter] = useState<FilterType>('today');
  const [filterLoading, setFilterLoading] = useState(false);
  /**
   * Businesses
   */
  const {
    data: businessesData,
    refetch: refetchBusinesses,
    isLoading: businessLoading,
    isFetching: businessesFetching,
  } = useGetBusinessesQuery({
    page: 1,
    limit: 200,
    filterType: filter,
  });

  /**
   * Analytics
   */
  const {
    data: business,
    isLoading,
    isFetching,
    refetch: refetchAnalytics,
  } = useGetBusinessByIdQuery({
    filterType: filter,
  });

  /**
   * Memoized Data
   */
  const businesses = businessesData ?? {};
  const pickups = business?.pickups ?? [];

  const totalParcels = useMemo(
    () =>
      pickups.reduce(
        (sum: number, item: any) => sum + (item.parcelsCount || 0),
        0,
      ),
    [pickups],
  );
  console.log(totalParcels);
  const totalPayments = useMemo(() => totalParcels * 5, [totalParcels]);

  const filterLabel = useMemo(() => {
    const labels: Record<FilterType, string> = {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
    };

    return labels[filter];
  }, [filter]);

  const isPageLoading =
    isLoading ||
    isFetching ||
    businessesFetching ||
    businessLoading ||
    filterLoading;

  /**
   * Fetch Analytics
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      setFilterLoading(true);

      await Promise.all([refetchBusinesses(), refetchAnalytics()]);
    } catch (error) {
      console.error('Analytics Error:', error);
    } finally {
      setFilterLoading(false);
    }
  }, [refetchBusinesses, refetchAnalytics]);

  /**
   * Filter Change
   */
  const handleFilterChange = async (value: FilterType) => {
    setFilter(value);

    setTimeout(async () => {
      await fetchAnalytics();
    }, 100);
  };

  /**
   * Socket Listener
   */
  useEffect(() => {
    if (!socket) return;

    const onParcelChange = async () => {
      await fetchAnalytics();
    };

    socket.on('Parcel-change', onParcelChange);

    return () => {
      socket.off('Parcel-change', onParcelChange);
    };
  }, [socket, fetchAnalytics]);

  /**
   * Skeleton KPI Card
   */
  const SkeletonCard = () => (
    <View
      className="bg-white rounded-2xl p-4 mr-3 border border-gray-200"
      style={{ width: 120, height: 130 }}
    >
      <View className="items-center justify-center animate-pulse">
        <View className="w-10 h-10 rounded-full bg-gray-200" />

        <View className="h-3 w-16 bg-gray-200 rounded mt-4" />

        <View className="h-6 w-20 bg-gray-200 rounded mt-4" />
      </View>
    </View>
  );

  /**
   * Skeleton Bars
   */
  const SkeletonBars = () => (
    <View className="bg-white rounded-2xl p-5 mt-4 border border-gray-200 animate-pulse">
      <View className="h-5 w-48 bg-gray-200 rounded mb-6" />

      {[...Array(5)].map((_, index) => (
        <View key={index} className="flex-row items-center mb-4">
          <View className="h-4 w-14 bg-gray-200 rounded mr-3" />

          <View
            className="h-5 bg-gray-200 rounded"
            style={{
              width: 50 + index * 30,
            }}
          />
        </View>
      ))}
    </View>
  );

  /**
   * KPI Card
   */
  const KPI_CARD_STYLE = {
    width: 180,
    marginRight: 10,
    padding: 14,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
  };

  const renderKpiCard = ({
    title,
    value,
    subtitle,
    titleColor,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    titleColor: string;
  }) => (
    <View
      style={{
        ...KPI_CARD_STYLE,
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      <Text
        style={{
          color: titleColor,
          fontWeight: '700',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: colors.text,
          fontSize: 24,
          fontWeight: '700',
        }}
      >
        {value}
      </Text>

      <Text
        style={{
          color: colors.subText,
          marginTop: 4,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );

  /**
   * Pickup Item
   */
  const renderPickupItem = ({ item }: any) => {
    const parcels = item.parcelsCount || 0;
    const payments = item.parcelsCount * 5 || 0;
    const active = parcels > 0;

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontWeight: '700',
            color: colors.text,
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          {item.pickupName}
        </Text>

        <Text
          style={{
            color: colors.secondary,
            marginBottom: 10,
          }}
        >
          {item.business}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: colors.subText,
                fontSize: 12,
              }}
            >
              Parcels
            </Text>

            <Text
              style={{
                color: colors.text,
                fontWeight: '700',
                fontSize: 18,
              }}
            >
              {parcels}
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: colors.subText,
                fontSize: 12,
              }}
            >
              Payments
            </Text>

            <Text
              style={{
                color: colors.success,
                fontWeight: '700',
                fontSize: 18,
              }}
            >
              KES {payments}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: active ? '#DCFCE7' : '#FEE2E2',
          }}
        >
          <Text
            style={{
              color: active ? colors.success : colors.error,
              fontWeight: '700',
            }}
          >
            {active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        paddingBottom: 10,
      }}
    >
      {/* Loading Indicator */}
      {filterLoading && (
        <View className="flex-row items-center mb-4">
          <ActivityIndicator size="small" color={colors.primary} />

          <Text
            style={{
              marginLeft: 10,
              color: colors.text,
              fontWeight: '600',
            }}
          >
            Updating analytics...
          </Text>
        </View>
      )}

      {/* KPI CARDS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 12,
        }}
      >
        {isPageLoading ? (
          [...Array(3)].map((_, index) => <SkeletonCard key={index} />)
        ) : (
          <>
            {renderKpiCard({
              title: 'Businesses',
              value: businesses.active || 0,
              subtitle: 'Active Businesses',
              titleColor: colors.primary ?? '',
            })}

            {renderKpiCard({
              title: 'Payments',
              value: `KES ${formatNumber(totalPayments)}`,
              subtitle: filterLabel,
              titleColor: colors.success ?? '',
            })}

            {filter === 'today' &&
              renderKpiCard({
                title: 'Pending',
                value: `KES ${formatNumber(totalPayments)}`,
                subtitle: 'Awaiting Settlement',
                titleColor: colors.warning ?? '',
              })}
          </>
        )}
      </ScrollView>

      {/* Charts */}
      {isPageLoading ? (
        <SkeletonBars />
      ) : (
        <FlatList
          data={pickups}
          keyExtractor={(item: any) => item.id || item.pickupId}
          renderItem={renderPickupItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          style={{
            backgroundColor: colors.background,
          }}
          ListHeaderComponent={
            <>
              <SectionHeader title={`Pickup Performance - ${filterLabel}`} />

              <SingleBarChart title="Parcels per Pickup" data={pickups} />

              <SectionHeader title="Pickup Summary" />
            </>
          }
          ListEmptyComponent={
            <View
              style={{
                alignItems: 'center',
                marginTop: 40,
              }}
            >
              <Text
                style={{
                  color: colors.subText,
                }}
              >
                No pickup data found
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <RadialFab
        mainColor={colors.primary}
        mainIcon="filter-outline"
        radius={120}
        angle={90}
        actions={[
          {
            icon: 'today-outline',
            label: 'Today',
            onPress: () => handleFilterChange('today'),
          },
          {
            icon: 'calendar-outline',
            label: 'Week',
            onPress: () => handleFilterChange('week'),
          },
          {
            icon: 'stats-chart-outline',
            label: 'Month',
            onPress: () => handleFilterChange('month'),
          },
          {
            icon: 'bar-chart-outline',
            label: 'Year',
            onPress: () => handleFilterChange('year'),
          },
        ]}
      />
    </View>
  );
}

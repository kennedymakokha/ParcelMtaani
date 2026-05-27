/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from './../../contexts/themeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import PieChart from './../../components/analytics/pieChart';
import { useFetchDashboardStatsQuery } from './../../services/apis/parcel.api';
import RadialFab from './../../components/buttons/radialFab';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from './../../contexts/socketContext';
import { useGetUserByIdQuery } from '../../services/apis/business.api';
import SingleBarChart from '../../components/analytics/barChart';
import { useFetchpaymentStatsQuery } from '../../services/apis/mpesa.api.ts';
import { formatNumber } from '../../utils/trancateText.ts';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const { socket } = useSocket();
  const { user } = useSelector((state: any) => state.auth);
  console.log(user);
  const [filter, setFilter] = useState('today');
  const [filterLoading, setFilterLoading] = useState(false);

  // Revenue
  const {
    data: revenue,
    refetch: fetchRevenues,
    isLoading: revenueLoading,
    isFetching: revenueFetching,
  } = useFetchpaymentStatsQuery({
    filterType: filter,
    pickupId: currentPickup?._id,
  });

  // Dashboard
  const {
    data: dashboardStats,
    isSuccess,
    refetch,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
  } = useFetchDashboardStatsQuery({
    pickupId: currentPickup?._id,
    filterType: filter,
    startDate: '',
    endDate: '',
  });

  // Pickup analytics
  const {
    data: business,
    refetch: fetch,
    isLoading: businessLoading,
    isFetching: businessFetching,
  } = useGetUserByIdQuery({
    id: currentPickup?._id,
    filterType: filter,
  });

  const isPageLoading =
    revenueLoading ||
    dashboardLoading ||
    businessLoading ||
    revenueFetching ||
    dashboardFetching ||
    businessFetching ||
    filterLoading;

  const revData = revenue ?? {};
  const pickups = business?.pickups ?? [];
  const KPIdata = dashboardStats ? dashboardStats : {};

  const filterLabel = useMemo(() => {
    switch (filter) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return '';
    }
  }, [filter]);

  const chartTitle = `Parcels Performance - ${filterLabel}`;

  const fetchAnalytics = useCallback(async () => {
    try {
      setFilterLoading(true);

      await Promise.all([refetch(), fetch(), fetchRevenues()]);
    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setFilterLoading(false);
    }
  }, []);

  const handleFilterChange = async (value: string) => {
    setFilter(value);
    setFilterLoading(true);

    setTimeout(async () => {
      await fetchAnalytics();
    }, 100);
  };

  const kpis = [
    {
      label: 'Revenue',
      value: ` ${formatNumber(revData?.totalRevenue) || 0}`,
      icon: 'wallet-outline',
      color: '#10B981',
    },
    {
      label: 'M-Pesa',
      value: ` ${formatNumber(revData?.mpesa?.total) || 0}`,
      icon: 'phone-portrait-outline',
      color: '#22C55E',
    },
    {
      label: 'Cash',
      value: ` ${formatNumber(revData?.cash?.total) || 0}`,
      icon: 'cash-outline',
      color: '#F59E0B',
    },
    {
      label: 'Total Parcels',
      value: KPIdata?.pickupStats?.totalParcels,
      icon: 'cube-outline',
      color: colors.primary,
    },
    {
      label: 'Delivered',
      value: KPIdata.pickupStats?.delivered,
      icon: 'checkmark-done-outline',
      color: colors.success,
    },
    {
      label: 'Pending',
      value: KPIdata.pickupStats?.pending,
      icon: 'time-outline',
      color: colors.warning,
    },
  ];

  useEffect(() => {
    if (!socket) return;

    const onParcelChange = async () => {
      await fetchAnalytics();
    };

    socket.on('Parcel-change', onParcelChange);

    return () => {
      socket.off('Parcel-change', onParcelChange);
    };
  }, [socket]);

  // Skeleton KPI Card
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

  // Skeleton Chart
  const SkeletonChart = () => (
    <View className="bg-white rounded-2xl p-5 mt-4 border border-gray-200 animate-pulse">
      <View className="h-5 w-40 bg-gray-200 rounded mb-5" />

      <View className="items-center justify-center">
        <View className="w-52 h-52 rounded-full bg-gray-200" />
      </View>
    </View>
  );

  // Skeleton Bar Chart
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
        }}
      >
        {/* Loading Overlay */}
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

        {/* KPI Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 16,
          }}
        >
          {isPageLoading
            ? [...Array(6)].map((_, index) => <SkeletonCard key={index} />)
            : kpis.map((kpi, index) => (
                <View
                  key={index}
                  style={{
                    width: 120,
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    marginRight: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex flex-col items-center justify-center">
                    <Ionicons name={kpi.icon} size={26} color={kpi.color} />

                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 14,
                        marginTop: 8,
                      }}
                    >
                      {kpi.label}
                    </Text>

                    <Text
                      style={{
                        color: kpi.color,
                        fontSize: 22,
                        fontWeight: '700',
                        marginTop: 4,
                      }}
                    >
                      {kpi.value}
                    </Text>
                  </View>
                </View>
              ))}
        </ScrollView>

        {/* Pie Chart */}
        {isPageLoading ? (
          <SkeletonChart />
        ) : (
          isSuccess && (
            <PieChart title="Pickup KPI Breakdown" data={KPIdata.pickupStats} />
          )
        )}

        {/* Bar Chart */}
        {isPageLoading ? (
          <SkeletonBars />
        ) : (
          user.role === 'admin' && (
            <SingleBarChart title={chartTitle} data={pickups} />
          )
        )}
      </ScrollView>

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
            onPress: async () => handleFilterChange('today'),
          },
          {
            icon: 'calendar-outline',
            label: 'Week',
            onPress: async () => handleFilterChange('week'),
          },
          {
            icon: 'stats-chart-outline',
            label: 'Month',
            onPress: async () => handleFilterChange('month'),
          },
          {
            icon: 'bar-chart-outline',
            label: 'Year',
            onPress: async () => handleFilterChange('year'),
          },
        ]}
      />
    </View>
  );
}

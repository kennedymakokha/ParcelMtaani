/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { View, Text, ScrollView } from 'react-native';
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
export default function AdminDashboard() {
  const { colors } = useTheme();

  const { socket } = useSocket();
  const { user } = useSelector((state: any) => state.auth);
  const [filter, setFilter] = useState('today');
  // Parcel-change
  const {
    data: dashboardStats,
    isSuccess,
    refetch,
  } = useFetchDashboardStatsQuery({
    pickupId: user?.pickup._id, // You can replace this with the actual pickup ID or "current" for the current pickup
    filterType: filter, // Options: 'daily', 'weekly', 'monthly'
    startDate: '', // Optional: Start date for filtering (YYYY-MM-DD)
    endDate: '', // Optional: End date for filtering (YYYY-MM-DD)
  });
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

  const {
    data: business,
   
    refetch: fetch,
  } = useGetUserByIdQuery({
    id: user.pickup._id,
    filterType: filter,
  });
  const pickups = business?.pickups ?? [];
  const KPIdata = dashboardStats ? dashboardStats : {};
  const fetchAnalytics = useCallback(async () => {
    try {
      await refetch();
      await fetch();
    } catch (err) {
      console.error('Analytics Error:', err);
    }
  }, []);
  const kpis = [
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

    {
      label: 'Cancelled',
      value: KPIdata.pickupStats?.cancelled,
      icon: 'close-circle-outline',
      color: colors.error,
    },
    {
      label: 'On Transit',
      value: KPIdata.pickupStats?.ontransit,
      icon: 'close-circle-outline',
      color: colors.secondary,
    },
    {
      label: 'Waiting',
      value: KPIdata.pickupStats?.awaiting,
      icon: 'close-circle-outline',
      color: colors.text,
    },
    {
      label: 'collected',
      value: KPIdata.pickupStats?.collected,
      icon: 'time-outline',
      color: colors.warning,
    },
  ];

  useEffect(() => {
    if (!socket) return;

    const onCanceledParcel = async (parcel: any) => {
      console.log(parcel);
      //

      await refetch();
    };

    socket.on('Parcel-change', onCanceledParcel);
    socket.on('pickup_shut', () => {});
    return () => {
      socket.off('Parcel-change', onCanceledParcel);
      socket.off('pickup_shut', () => {});
    };
  }, [socket, refetch]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* KPI Cards */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingRight: 16, // 👈 important
          }}
        >
          {kpis.map((kpi, index) => (
            <View
              key={index}
              style={{
                width: 120, // or Dimensions-based
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 16,
                marginBottom: 12,
                marginRight: 8, // instead of gap for better support
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View className="flex flex-col items-center justify-center">
                <Ionicons name={kpi.icon} size={26} color={kpi.color} />
                <Text
                  style={{ color: colors.text, fontSize: 14, marginTop: 8 }}
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
        {/* Chart */}

        {isSuccess && (
          <PieChart
            title="Pickup KPI Breakdown"
            data={KPIdata.pickupStats} // pass one pickup object
          />
        )}
   
        <SingleBarChart title={chartTitle} data={pickups} />
        {/* {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={async (event: any, date: any) => {
            setShowDatePicker(false);
            if (date) {
              const formattedDate = date.toISOString().split('T')[0];
              console.log(formattedDate);
              setCustomDate(formattedDate);
              setFilter('month');
              await fetchAnalytics();

              // await fetchAnalytics('custom', formattedDate);
            }
          }}
        />
      )} */}
      </ScrollView>
      <RadialFab
        mainColor={colors.primary}
        mainIcon="filter-outline"
        radius={120}
        angle={90}
        actions={[
          {
            icon: 'today-outline',
            label: 'Today',
            onPress: async () => {
              setFilter('today');
              await fetchAnalytics();
            },
          },
          {
            icon: 'calendar-outline',
            label: 'Week',
            onPress: async () => {
              setFilter('week');
              await fetchAnalytics();
            },
          },
          {
            icon: 'stats-chart-outline',
            label: 'Month',
            onPress: async () => {
              setFilter('month');
              await fetchAnalytics();
            },
          },
          {
            icon: 'bar-chart-outline',
            label: 'Year',
            onPress: async () => {
              setFilter('year');
              await fetchAnalytics();
            },
          },
        ]}
      />
    </View>
  );
}

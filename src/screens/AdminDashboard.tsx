/* eslint-disable react-native/no-inline-styles */
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MultiLineChart from '../components/analytics/Linegraph';
import { useSelector } from 'react-redux';
import MultiBarChart from '../components/analytics/multiBarChart';
import PieChart from '../components/analytics/pieChart';
import { useFetchDashboardStatsQuery } from '../services/apis/parcel.api';


export default function DashboardScreen() {
  const { colors } = useTheme();
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  const {
    data: dashboardStats, 
    isSuccess,
  } = useFetchDashboardStatsQuery({
    pickupId: currentPickup._id, // You can replace this with the actual pickup ID or "current" for the current pickup
    filterType: '', // Options: 'daily', 'weekly', 'monthly'
    startDate: '', // Optional: Start date for filtering (YYYY-MM-DD)
    endDate: '', // Optional: End date for filtering (YYYY-MM-DD)
  });
  const KPIdata = dashboardStats ? dashboardStats : {};

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
      label: 'collected',
      value: KPIdata.pickupStats?.collected,
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
      color: colors.error,
    },
  ];

  // 📈 Static Chart Data
  const hourlyData = [
    { key: '08', value: 20 },
    { key: '09', value: 35 },
    { key: '10', value: 50 },
    { key: '11', value: 45 },
    { key: '12', value: 60 },
    { key: '13', value: 80 },
    { key: '14', value: 75 },
    { key: '15', value: 90 },
    { key: '16', value: 110 },
  ];

  const datasets = [
    {
      label: 'Intake',
      color: colors.primary,
      data: hourlyData,
    },
    {
      label: 'Delivered',
      color: colors.success,
      data: hourlyData.map(d => ({ ...d, value: d.value - 15 })),
    },
  ];

  return (
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
              <Text style={{ color: colors.text, fontSize: 14, marginTop: 8 }}>
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
      <MultiLineChart
        title="Hourly Parcel Trends"
        datasets={datasets}
        startHour={8}
        endHour={16}
      />
      {isSuccess && (
        <PieChart
          title="Pickup KPI Breakdown"
          data={KPIdata.pickupStats} // pass one pickup object
        />
      )}
      {/* Another Chart Example */}
      <MultiLineChart
        title="Delivery Performance"
        datasets={[
          {
            label: 'Delivered',
            color: colors.success,
            data: hourlyData.map(d => ({ ...d, value: d.value + 10 })),
          },
          {
            label: 'Failed',
            color: colors.error,
            data: hourlyData.map(d => ({
              ...d,
              value: Math.max(0, d.value - 60),
            })),
          },
        ]}
        startHour={8}
        endHour={16}
      />

      {isSuccess && (
        <MultiBarChart
          title="Business Pickup KPIs"
          data={KPIdata.groupedByPickup}
        />
      )}
    </ScrollView>
  );
}

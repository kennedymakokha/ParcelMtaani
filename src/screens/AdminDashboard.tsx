/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/themeContext';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MultiLineChart from '../components/analytics/Linegraph';
import { useFetchDashboardStatsQuery } from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );

  const { data: dashboardStats, refetch } = useFetchDashboardStatsQuery({
    pickupId: currentPickup, // You can replace this with the actual pickup ID or "current" for the current pickup
    filterType: '', // Options: 'daily', 'weekly', 'monthly'
    startDate: '', // Optional: Start date for filtering (YYYY-MM-DD)
    endDate: '', // Optional: End date for filtering (YYYY-MM-DD)
  });
  const stats = dashboardStats?.kpis || {};
  console.log(stats);
  // 📊 Static KPI Data
  const kpis = [
    {
      label: 'Total Parcels',
      value: 1280,
      icon: 'cube-outline',
      color: colors.primary,
    },
    {
      label: 'Delivered Today',
      value: 320,
      icon: 'checkmark-done-outline',
      color: colors.success,
    },
    {
      label: 'Pending',
      value: 88,
      icon: 'time-outline',
      color: colors.warning,
    },
    {
      label: 'collected',
      value: 88,
      icon: 'time-outline',
      color: colors.warning,
    },
    {
      label: 'Cancelled',
      value: 12,
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
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        {kpis.map((kpi, index) => (
          <View
            key={index}
            style={{
              width: '48%',
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
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
        ))}
      </View>
      <TouchableOpacity onPress={async() => await refetch()}>
        <Text
          style={{
            color: colors.primary,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Refresh Data
        </Text>
      </TouchableOpacity>
      {/* Chart */}
      <MultiLineChart
        title="Hourly Parcel Trends"
        datasets={datasets}
        startHour={8}
        endHour={16}
      />

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
    </ScrollView>
  );
}

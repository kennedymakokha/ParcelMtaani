/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import { SectionHeader } from '../../components/ui/sectionHeader';
import {
  useFetchPickupsQuery,
  useGetBusinessByIdQuery,
} from '../../services/apis/business.api';
import { SkeletonBlock } from '../../components/skeletons/dashBoardSkeleton';
import SingleBarChart from '../../components/analytics/barChart';
import { useSocket } from '../../contexts/socketContext';
import { useSelector } from 'react-redux';
import PieChart from '../../components/analytics/pieChart';
import { useFetchDashboardStatsQuery } from '../../services/apis/parcel.api';
import RadialFab from '../../components/buttons/radialFab';

export default function SuperAdminDashboard() {
  const { colors } = useTheme();
  const { socket } = useSocket();

  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'year'>(
    'today',
  );
  const [filterLoading, setFilterLoading] = useState(false);

  const {
    user: { business: b },
  } = useSelector((state: any) => state.auth);

  const currentPickup = useSelector((state: any) => state.pickups.currentPickup);

  const { data: pickupdata } = useFetchPickupsQuery({});
  const {
    data: business,
    isLoading,
    refetch: fetch,
  } = useGetBusinessByIdQuery({
    id: b._id,
    filterType: filter,
  });

  const pickups = business?.pickups ?? [];

  const {
    data: dashboardStats,
    refetch,
    isSuccess: loading,
  } = useFetchDashboardStatsQuery({
    pickupId: currentPickup?._id,
    filterType: filter,
    startDate: '',
    endDate: '',
  });

  const KPIdata = dashboardStats ?? {};

  const totalParcels = pickups.reduce(
    (sum: number, p: any) => sum + (p.parcelsCount || 0),
    0,
  );

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
      await Promise.all([refetch(), fetch()]);
      setFilterLoading(false);
    } catch (err) {
      console.error('Analytics Error:', err);
      setFilterLoading(false);
    }
  }, [refetch]);

  // ✅ Trigger loaders when currentPickup changes
  useEffect(() => {
    if (!currentPickup) return;
    const refreshOnPickupChange = async () => {
      setFilterLoading(true);
      await refetch();
      setFilterLoading(false);
    };
    refreshOnPickupChange();
  }, [currentPickup]);

  useEffect(() => {
    if (!socket) return;
    const parcelChange = async () => await refetch();
    const onNewBusiness = async () => await refetch();

    socket.on('Parcel-change', parcelChange);
    socket.on('New Business', onNewBusiness);

    return () => {
      socket.off('Parcel-change', parcelChange);
      socket.off('New Business', onNewBusiness);
    };
  }, [socket, refetch]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* KPI Cards */}
      {isLoading || filterLoading ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                marginHorizontal: 4,
                padding: 12,
                borderRadius: 8,
              }}
            >
              <SkeletonBlock height={16} style={{ marginBottom: 12 }} />
              <SkeletonBlock height={24} width={60} />
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.card, marginRight: 8, padding: 12, borderRadius: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Total Pickup points</Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              {pickupdata?.pickups?.length || 0}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, marginLeft: 8, padding: 12, borderRadius: 8 }}>
            <Text style={{ color: colors.success, fontWeight: '700' }}>Payments {filterLabel}</Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>KES 40,000</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.card, marginLeft: 8, padding: 12, borderRadius: 8 }}>
            <Text style={{ color: colors.warning, fontWeight: '700' }}>Pending Payments</Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>KES {totalParcels * 5}</Text>
          </View>
        </View>
      )}

      <FlatList
        data={pickups}
        keyExtractor={item => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ flex: 1, backgroundColor: colors.background }}
        ListHeaderComponent={
          <>
            <SectionHeader title={`Pickup Performance for ${currentPickup?.pickup_name || '...'}`} />

            {filterLoading ? (
              <View>
                <SkeletonBlock height={200} style={{ marginBottom: 16, borderRadius: 8 }} />
                <SkeletonBlock height={200} style={{ marginBottom: 16, borderRadius: 8 }} />
              </View>
            ) : !loading ? (
              <SkeletonBlock height={200} style={{ marginBottom: 16, borderRadius: 8 }} />
            ) : (
              <>
                {KPIdata.pickupStats && (
                  <PieChart
                    title={`Pickup KPI Breakdown (${filterLabel})`}
                    data={KPIdata.pickupStats}
                  />
                )}
                <SectionHeader title={chartTitle} />
                <SingleBarChart title={chartTitle} data={pickups} />
              </>
            )}
          </>
        }
        renderItem={() => null}
      />

      {/* FILTER FAB */}
      <RadialFab
        mainColor={colors.primary}
        mainIcon="filter-outline"
        radius={120}
        angle={90}
        actions={[
          { icon: 'today-outline', label: 'Today', onPress: () => handleFilterChange('today') },
          { icon: 'calendar-outline', label: 'Week', onPress: () => handleFilterChange('week') },
          { icon: 'stats-chart-outline', label: 'Month', onPress: () => handleFilterChange('month') },
          { icon: 'bar-chart-outline', label: 'Year', onPress: () => handleFilterChange('year') },
        ]}
      />
    </View>
  );

  async function handleFilterChange(newFilter: 'today' | 'week' | 'month' | 'year') {
    setFilter(newFilter);
    await fetchAnalytics();
  }
}

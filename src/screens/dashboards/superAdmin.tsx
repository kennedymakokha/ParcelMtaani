/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

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

  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );

  const { data: pickupdata } = useFetchPickupsQuery({});

  const {
    data: business,
    isLoading,
    refetch: fetch,
    isFetching,
  } = useGetBusinessByIdQuery({
    id: b._id,
    filterType: filter,
  });

  const pickups = business?.pickups ?? [];

  const {
    data: dashboardStats,
    refetch,
    isSuccess,
    isFetching: dashboardFetching,
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

  const loading = isLoading || filterLoading || isFetching || dashboardFetching;

  const fetchAnalytics = useCallback(async () => {
    try {
      setFilterLoading(true);

      await Promise.all([refetch(), fetch()]);
    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setFilterLoading(false);
    }
  }, [refetch, fetch]);

  // pickup change
  useEffect(() => {
    if (!currentPickup) return;

    const refreshOnPickupChange = async () => {
      setFilterLoading(true);

      await refetch();

      setFilterLoading(false);
    };

    refreshOnPickupChange();
  }, [currentPickup]);

  // sockets
  useEffect(() => {
    if (!socket) return;

    const parcelChange = async () => await fetchAnalytics();

    const onNewBusiness = async () => await fetchAnalytics();

    socket.on('Parcel-change', parcelChange);

    socket.on('New Business', onNewBusiness);

    return () => {
      socket.off('Parcel-change', parcelChange);

      socket.off('New Business', onNewBusiness);
    };
  }, [socket]);

  const handleFilterChange = async (
    newFilter: 'today' | 'week' | 'month' | 'year',
  ) => {
    setFilter(newFilter);

    setFilterLoading(true);

    setTimeout(async () => {
      await fetchAnalytics();
    }, 100);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      {/* FILTER LOADER */}
      {filterLoading && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
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
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginBottom: 16,
          }}
        >
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={{
                width: 180,
                backgroundColor: colors.card,
                marginRight: 10,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <SkeletonBlock
                height={14}
                width={100}
                style={{
                  marginBottom: 14,
                }}
              />

              <SkeletonBlock height={26} width={80} />

              <SkeletonBlock
                height={10}
                width={120}
                style={{
                  marginTop: 10,
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 12,
          }}
        >
          {/* PICKUPS */}
          <View
            style={{
              width: 180,
              backgroundColor: colors.card,
              marginRight: 10,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Pickup Points
            </Text>

            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: '700',
              }}
            >
              {pickupdata?.pickups?.length || 0}
            </Text>

            <Text
              style={{
                color: colors.subText,
                marginTop: 4,
              }}
            >
              Active Pickup Stations
            </Text>
          </View>

          {/* PAYMENTS */}
          <View
            style={{
              width: 180,
              backgroundColor: colors.card,
              marginRight: 10,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.success,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Payments
            </Text>

            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: '700',
              }}
            >
              KES 40,000
            </Text>

            <Text
              style={{
                color: colors.subText,
                marginTop: 4,
              }}
            >
              {filterLabel}
            </Text>
          </View>

          {/* PENDING */}
          <View
            style={{
              width: 180,
              backgroundColor: colors.card,
              marginRight: 10,
              padding: 14,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.warning,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              Pending Payments
            </Text>

            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: '700',
              }}
            >
              KES {totalParcels * 5}
            </Text>

            <Text
              style={{
                color: colors.subText,
                marginTop: 4,
              }}
            >
              Awaiting Settlement
            </Text>
          </View>
        </ScrollView>
      )}

      {/* MAIN CONTENT */}
      <FlatList
        data={pickups}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <SectionHeader
              title={`Pickup Performance for ${
                currentPickup?.pickup_name || '...'
              }`}
            />

            {/* CHART LOADING */}
            {loading ? (
              <View>
                <SkeletonBlock
                  height={240}
                  style={{
                    marginBottom: 16,
                    borderRadius: 18,
                  }}
                />

                <SkeletonBlock
                  height={260}
                  style={{
                    marginBottom: 16,
                    borderRadius: 18,
                  }}
                />
              </View>
            ) : !isSuccess ? (
              <SkeletonBlock
                height={240}
                style={{
                  borderRadius: 18,
                }}
              />
            ) : (
              <>
                {/* PIE CHART */}
                {KPIdata.pickupStats && (
                  <PieChart
                    title={`Pickup KPI Breakdown (${filterLabel})`}
                    data={KPIdata.pickupStats}
                  />
                )}

                {/* BAR CHART */}
                <SectionHeader title={chartTitle} />

                <SingleBarChart title={chartTitle} data={pickups} />
              </>
            )}

            {/* PICKUPS LIST */}
            <SectionHeader title="Pickup Summary" />
          </>
        }
        renderItem={({ item }) =>
          loading ? (
            <SkeletonBlock
              height={120}
              style={{
                marginBottom: 12,
                borderRadius: 16,
              }}
            />
          ) : (
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
                {item?.business}
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
                    {item.parcelsCount || 0}
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
                    KES {(item.parcelsCount || 0) * 5}
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
                  backgroundColor:
                    item.parcelsCount > 0 ? '#DCFCE7' : '#FEE2E2',
                }}
              >
                <Text
                  style={{
                    color:
                      item.parcelsCount > 0 ? colors.success : colors.error,
                    fontWeight: '700',
                  }}
                >
                  {item.parcelsCount > 0 ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          )
        }
        ListEmptyComponent={
          !loading ? (
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
                No pickup analytics found
              </Text>
            </View>
          ) : (
            <View>
              {[1, 2, 3].map(i => (
                <SkeletonBlock
                  key={i}
                  height={120}
                  style={{
                    marginBottom: 12,
                    borderRadius: 16,
                  }}
                />
              ))}
            </View>
          )
        }
      />

      {/* FILTER FAB */}
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

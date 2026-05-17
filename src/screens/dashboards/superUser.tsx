/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useTheme } from './../../contexts/themeContext';

import { SectionHeader } from '../../components/ui/sectionHeader';

import {
  useGetBusinessByIdQuery,
  useGetBusinessesQuery,
} from '../../services/apis/business.api';

import { SkeletonBlock } from '../../components/skeletons/dashBoardSkeleton';

import SingleBarChart from '../../components/analytics/barChart';

import { useSocket } from '../../contexts/socketContext';

import RadialFab from '../../components/buttons/radialFab';

export default function SuperUserDashboard() {
  const { colors } = useTheme();

  const { socket } = useSocket();

  const [filter, setFilter] = useState<
    'today' | 'week' | 'month' | 'year'
  >('today');

  const [filterLoading, setFilterLoading] =
    useState(false);

  // businesses
  const {
    data: businessesData,
    refetch,
    isFetching: businessesFetching,
  } = useGetBusinessesQuery({
    page: 1,
    limit: 200,
    filterType: filter,
  });

  // analytics
  const {
    data: business,
    isLoading,
    isFetching,
    refetch: refetchBusiness,
  } = useGetBusinessByIdQuery({
    filterType: filter,
  });

  const businesses = businessesData ?? {};

  const pickups = business?.pickups ?? [];

  const totalParcels = useMemo(
    () =>
      pickups.reduce(
        (sum: any, p: any) =>
          sum + p.parcelsToday,
        0
      ),
    [pickups]
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

  const loading =
    isLoading ||
    isFetching ||
    businessesFetching ||
    filterLoading;

  // refresh analytics
  const fetchAnalytics = async () => {
    try {
      setFilterLoading(true);

      await Promise.all([
        refetch(),
        refetchBusiness(),
      ]);
    } catch (err) {
      console.log(err);
    } finally {
      setFilterLoading(false);
    }
  };

  // handle filter
  const handleFilterChange = async (
    value:
      | 'today'
      | 'week'
      | 'month'
      | 'year'
  ) => {
    setFilter(value);

    setFilterLoading(true);

    setTimeout(async () => {
      await fetchAnalytics();
    }, 100);
  };

  // sockets
  useEffect(() => {
    if (!socket) return;

    const parcelChange = async () => {
      await fetchAnalytics();
    };

    const onNewBusiness = async () => {
      await fetchAnalytics();
    };

    socket.on('Parcel-change', parcelChange);

    socket.on('New  Business', onNewBusiness);

    return () => {
      socket.off(
        'Parcel-change',
        parcelChange
      );

      socket.off(
        'New  Business',
        onNewBusiness
      );
    };
  }, [socket]);

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
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

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

              <SkeletonBlock
                height={26}
                width={80}
              />

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
          {/* BUSINESSES */}
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
              Businesses
            </Text>

            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: '700',
              }}
            >
              {businesses.active || 0}
            </Text>

            <Text
              style={{
                color: colors.subText,
                marginTop: 4,
              }}
            >
              Active Businesses
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
              Pending
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
        keyExtractor={item => item.id}
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
              title={`Pickup Performance - ${filterLabel}`}
            />

            {/* CHART */}
            {loading ? (
              <SkeletonBlock
                height={240}
                style={{
                  marginBottom: 16,
                  borderRadius: 18,
                }}
              />
            ) : (
              <SingleBarChart
                title="Parcels per Pickup"
                data={pickups}
              />
            )}

            <SectionHeader
              title="Pickup Summary"
            />
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
                  justifyContent:
                    'space-between',
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
                    {item.parcelsToday}
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
                    KES{' '}
                    {item.parcelsToday * 5}
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
                    item.parcelsToday > 0
                      ? '#DCFCE7'
                      : '#FEE2E2',
                }}
              >
                <Text
                  style={{
                    color:
                      item.parcelsToday > 0
                        ? colors.success
                        : colors.error,
                    fontWeight: '700',
                  }}
                >
                  {item.parcelsToday > 0
                    ? 'Active'
                    : 'Inactive'}
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
                No pickup data found
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
            onPress: async () =>
              handleFilterChange(
                'today'
              ),
          },
          {
            icon: 'calendar-outline',
            label: 'Week',
            onPress: async () =>
              handleFilterChange(
                'week'
              ),
          },
          {
            icon: 'stats-chart-outline',
            label: 'Month',
            onPress: async () =>
              handleFilterChange(
                'month'
              ),
          },
          {
            icon: 'bar-chart-outline',
            label: 'Year',
            onPress: async () =>
              handleFilterChange(
                'year'
              ),
          },
        ]}
      />
    </View>
  );
}
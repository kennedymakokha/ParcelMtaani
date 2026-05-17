/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useSelector } from 'react-redux';

import { useTheme } from '../../contexts/themeContext';
import { useSocket } from '../../contexts/socketContext';

import { SkeletonBlock } from '../../components/skeletons/dashBoardSkeleton';

import { useFetchdriverparcelQuery } from '../../services/apis/parcel.api';

import RadialFab from '../../components/buttons/radialFab';

export default function DriverDashboard() {
  const { colors } = useTheme();
  const { socket } = useSocket();

  const { user } = useSelector((state: any) => state.auth);

  const [filter, setFilter] = useState('today');

  const [selectedPickup, setSelectedPickup] =
    useState<string | null>(null);

  const [filterLoading, setFilterLoading] = useState(false);

  // fetch dashboard data
  const {
    data: dashboardStats,
    isLoading,
    isFetching,
    refetch,
  } = useFetchdriverparcelQuery({
    driverId: user._id,
    filter: filter,
    startDate: '',
    endDate: '',
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setFilterLoading(true);

      await refetch();
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

  // transform API data
  const badgeData = useMemo(
    () =>
      dashboardStats?.map((item: any) => ({
        id: item._id,
        pickup: item.pickup_name,
        count: item.totalParcels,
        parcels: item.parcels,
      })) || [],
    [dashboardStats]
  );

  // filter data
  const filteredData = selectedPickup
    ? badgeData.filter(
        (item: any) => item.id === selectedPickup
      )
    : badgeData;

  // sockets
  useEffect(() => {
    if (!socket) return;

    const parcelChange = async () => {
      await fetchAnalytics();
    };

    socket.on('Parcel-change', parcelChange);

    return () => {
      socket.off('Parcel-change', parcelChange);
    };
  }, [socket]);

  const loading =
    isLoading || isFetching || filterLoading;

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
            marginBottom: 12,
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
            Updating parcels...
          </Text>
        </View>
      )}

      {/* KPI Skeleton */}
      {loading ? (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
          }}
        >
          {[1, 2, 3].map(i => (
            <SkeletonBlock
              key={i}
              height={70}
              style={{
                flex: 1,
                marginRight: i !== 3 ? 8 : 0,
                borderRadius: 14,
              }}
            />
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginBottom: 16,
          }}
        >
          {badgeData.map((item: any) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                padding: 16,
                marginRight: 10,
                minWidth: 120,
              }}
            >
              <Text
                style={{
                  color: colors.subText,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {item.pickup}
              </Text>

              <Text
                style={{
                  color: colors.primary,
                  fontSize: 26,
                  fontWeight: '700',
                }}
              >
                {item.count}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
        ListHeaderComponent={
          loading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                marginBottom: 16,
              }}
            >
              {[1, 2, 3, 4].map(i => (
                <SkeletonBlock
                  key={i}
                  height={40}
                  width={100}
                  style={{
                    borderRadius: 999,
                    marginRight: 10,
                  }}
                />
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 50,
                marginBottom: 16,
              }}
            >
              {/* ALL FILTER */}
              <TouchableOpacity
                onPress={() => setSelectedPickup(null)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 10,
                  marginRight: 8,
                  backgroundColor:
                    selectedPickup === null
                      ? colors.primary
                      : colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color:
                      selectedPickup === null
                        ? '#fff'
                        : colors.text,
                    fontWeight: '600',
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>

              {/* DYNAMIC FILTERS */}
              {badgeData.map((item: any) => {
                const isSelected =
                  selectedPickup === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      setSelectedPickup(item.id)
                    }
                    style={{
                      paddingHorizontal: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 6,
                      borderRadius: 10,
                      marginRight: 8,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected
                          ? '#fff'
                          : colors.text,
                        textTransform: 'capitalize',
                        fontWeight: '600',
                        marginRight: 6,
                      }}
                    >
                      {item.pickup}
                    </Text>

                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 999,
                        backgroundColor: isSelected
                          ? '#fff'
                          : colors.border,
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected
                            ? colors.primary
                            : colors.text,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
                        {item.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )
        }
        renderItem={({ item }) =>
          loading ? (
            <SkeletonBlock
              height={180}
              style={{
                marginBottom: 12,
                borderRadius: 16,
              }}
            />
          ) : (
            <View
              style={{
                backgroundColor: colors.card,
                padding: 14,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* PICKUP NAME */}
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  marginBottom: 12,
                  color: colors.text,
                }}
              >
                {item.pickup}
              </Text>

              {/* PARCELS */}
              {item.parcels.map((parcel: any) => (
                <View
                  key={parcel._id}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor:
                      colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: '600',
                      marginBottom: 4,
                    }}
                  >
                    {parcel.code}
                  </Text>

                  <Text
                    style={{
                      color: colors.subText,
                      marginBottom: 2,
                    }}
                  >
                    Status: {parcel.status}
                  </Text>

                  <Text
                    style={{
                      color: colors.subText,
                      marginBottom: 2,
                    }}
                  >
                    Sender: {parcel.sender_name}
                  </Text>

                  <Text
                    style={{
                      color: colors.subText,
                    }}
                  >
                    Receiver: {parcel.receiver_name}
                  </Text>
                </View>
              ))}
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
                No parcels found
              </Text>
            </View>
          ) : (
            <View>
              {[1, 2, 3].map(i => (
                <SkeletonBlock
                  key={i}
                  height={180}
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
              handleFilterChange('today'),
          },
          {
            icon: 'calendar-outline',
            label: 'Week',
            onPress: async () =>
              handleFilterChange('week'),
          },
          {
            icon: 'stats-chart-outline',
            label: 'Month',
            onPress: async () =>
              handleFilterChange('month'),
          },
          {
            icon: 'bar-chart-outline',
            label: 'Year',
            onPress: async () =>
              handleFilterChange('year'),
          },
        ]}
      />
    </View>
  );
}
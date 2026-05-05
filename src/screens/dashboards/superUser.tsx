/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from './../../contexts/themeContext';

import { SectionHeader } from '../../components/ui/sectionHeader';
import {
  useGetBusinessByIdQuery,
  useGetBusinessesQuery,
} from '../../services/apis/business.api';
import { SkeletonBlock } from '../../components/skeletons/dashBoardSkeleton';
import SingleBarChart from '../../components/analytics/barChart';
import { useSocket } from '../../contexts/socketContext';

export default function SuperUserDashboard() {
  const { colors } = useTheme();
  const { socket } = useSocket();
  const { data: businessesData, refetch } = useGetBusinessesQuery({
    page: 1,
    limit: 200,
  }); // 👈 ensure backend supports page
  const businesses = businessesData ?? {};
  const { data: business, isLoading } = useGetBusinessByIdQuery(undefined);
  const pickups = business?.pickups ?? [];

  const totalParcels = pickups.reduce(
    (sum: any, p: any) => sum + p.parcelsToday,
    0,
  );

  useEffect(() => {
    if (!socket) return;

    const parcelChange = async () => {
      await refetch();
    };
    const onNewBusines = async () => {
      await refetch();
    };
    socket.on('Parcel-change', parcelChange);
    socket.on('New  Business', onNewBusines);
    return () => {
      socket.off('Parcel-change', parcelChange);
      socket.off('New  Business', onNewBusines);
    };
  }, [socket, refetch]);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* KPI Cards */}

      {isLoading ? (
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          {[1, 2, 3].map(i => (
            <SkeletonBlock
              key={i}
              height={70}
              style={{ flex: 1, marginRight: i !== 3 ? 8 : 0 }}
            />
          ))}
        </View>
      ) : (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              marginRight: 8,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              Total Businesses
            </Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              {businesses.active} Active
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              marginLeft: 8,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.success, fontWeight: '700' }}>
              Payments Today
            </Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>KES 40,000</Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              marginLeft: 8,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.warning, fontWeight: '700' }}>
              Pending Payments{' '}
            </Text>
            <Text style={{ color: colors.text, fontSize: 18 }}>
              KES {totalParcels * 5}
            </Text>
          </View>
        </View>
      )}
      <FlatList
        data={pickups}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        style={{ flex: 1, backgroundColor: colors.background }}
        ListHeaderComponent={
          <>
            <SectionHeader title="Daily Pickup Perfomance" />

            {isLoading ? (
              <SkeletonBlock height={200} style={{ marginBottom: 16 }} />
            ) : (
              <SingleBarChart title="Parcels per Pickup" data={pickups} />
            )}
          </>
        }
        renderItem={
          isLoading
            ? () => (
                <View>
                  {[1, 2, 3, 4].map(i => (
                    <SkeletonBlock
                      key={i}
                      height={100}
                      style={{ marginBottom: 12 }}
                    />
                  ))}
                </View>
              )
            : ({ item }) => (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontWeight: '600', color: colors.text }}>
                    {item.pickupName}
                  </Text>
                  <Text style={{ color: colors.secondary }}>
                    {item?.business}
                  </Text>
                  <Text style={{ color: colors.text }}>
                    Parcels: {item.parcelsToday}
                  </Text>
                  <Text style={{ color: colors.text }}>
                    Payment: KES {item.parcelsToday * 5}
                  </Text>
                  <Text
                    style={{
                      color:
                        item.parcelsToday > 0 ? colors.success : colors.error,
                    }}
                  >
                    Status: {item.parcelsToday > 0 ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              )
        }
      />
      {/* FAB for actions */}
    </View>
  );
}

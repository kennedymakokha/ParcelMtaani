/* eslint-disable react-native/no-inline-styles */
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../../contexts/themeContext';
import { useGetBusinessByIdQuery } from '../../services/apis/business.api';
import { SectionHeader } from '../../components/ui/sectionHeader';

export default function BusinessDetailScreen({ route, }: any) {
  const {
    _id,
   
  } = route.params.item;
  const { colors } = useTheme();
  const { data: business, isLoading } = useGetBusinessByIdQuery(_id);
  const pickups = business?.pickups ?? [];
 
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>Loading business details...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.error }}>Business not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* Pickups List */}
      <SectionHeader title="Linked Pickups" />

      <FlatList
        data={pickups || []}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 16,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* HEADER */}
            <View style={{ marginBottom: 10 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.text,
                }}
              >
                {item.pickupName}
              </Text>

              {/* STATUS BADGE */}
              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor:
                    item.parcelsToday > 0
                      ? '#16a34a20' // green
                      : '#6b728020', // gray
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: item.parcelsToday > 0 ? '#16a34a' : '#6b7280',
                  }}
                >
                  {item.parcelsToday > 0 ? 'ACTIVE' : 'NO ACTIVITY'}
                </Text>
              </View>
            </View>

            {/* KPI SECTION */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              {/* LEFT: Label */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.secondary,
                  }}
                >
                  Parcels Today
                </Text>

                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color:
                      item.parcelsToday > 0 ? colors.primary : colors.secondary,
                  }}
                >
                  {item.parcelsToday}
                </Text>
              </View>

              {/* RIGHT: Visual indicator */}
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor:
                    item.parcelsToday > 0
                      ? colors.primary + '20'
                      : colors.border,
                }}
              >
                <Text style={{ fontSize: 18 }}>
                  {item.parcelsToday > 0 ? '📦' : '📭'}
                </Text>
              </View>
            </View>

            {/* DIVIDER */}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 12,
              }}
            />

          
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.secondary }}>
            No pickups linked to this business.
          </Text>
        }
      />

      {/* Actions */}
    </View>
  );
}

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
 
  ScrollView,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFetchparcelJourneyQuery } from '../services/apis/parcel.api';
import JourneyTimeline from '../components/JourneyTimeline';

interface Parcel {
  _id: string;
  code: string;
  from: string;
  pickup: string;
  status: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  weight: string;
  instructions: string;
  price: string;
}

export default function ParcelDetailsScreen({ route }: any) {
  const { colors } = useTheme();
  const parcel: Parcel = route.params?.parcel;
  // console.log(parcel);
  const { data } = useFetchparcelJourneyQuery(`${parcel?._id}`);
 
  const journey = data ? data.journey : {};
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Parcel Details
        </Text>

        {/* General Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Ionicons name="barcode-outline" size={18} color={colors.primary} />
            <Text style={[styles.label, { color: colors.secondary }]}>
              Code:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.code}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.label, { color: colors.secondary }]}>
              From:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.from}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.label, { color: colors.secondary }]}>
              Pickup:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.pickup}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="cube-outline" size={18} color={colors.primary} />
            <Text style={[styles.label, { color: colors.secondary }]}>
              Status:
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    parcel.status === 'Delivered'
                      ? colors.success
                      : parcel.status === 'In Transit'
                      ? colors.warning
                      : colors.error,
                },
              ]}
            >
              {parcel.status}
            </Text>
          </View>
        </View>

        {/* Sender */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            <Ionicons name="person-outline" size={16} /> Sender
          </Text>

          <View style={styles.row}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.sender_name}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.sender_phone}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.sender_address}
            </Text>
          </View>
        </View>

        {/* Receiver */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            <Ionicons name="people-outline" size={16} /> Receiver
          </Text>

          <View style={styles.row}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.receiver_name}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.receiver_phone}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="home-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, { color: colors.text }]}>
              {parcel.receiver_address}
            </Text>
          </View>
        </View>

        {/* Actions */}
      
      </View>
      <JourneyTimeline journey={journey} colors={colors}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  section: {
    marginTop: 12,
    borderWidth: 1,
    padding: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});

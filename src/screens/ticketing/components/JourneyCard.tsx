/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../../contexts/themeContext';

interface Journey {
  from: string;
  destination: string;
  trip: string;
  truck: string;
  seat: string;
}

interface Props {
  journey: Journey;
  setJourney: React.Dispatch<React.SetStateAction<Journey>>;

  routes?: any[];
  trips?: any[];
  trucks?: any[];
}

export default function JourneyCard({
  journey,
  setJourney,
  routes = [],
  trips = [],
  trucks = [],
}: Props) {

  const { colors } = useTheme();

  const update = (field: keyof Journey, value: string) => {
    setJourney(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}>

      <View style={styles.header}>
        <Icon
          name="map-marker-path"
          size={22}
          color={colors.primary}
        />

        <Text
          style={[
            styles.title,
            { color: colors.text },
          ]}>
          Journey Details
        </Text>
      </View>

      {/* FROM */}

      <Text style={[styles.label, { color: colors.secondary }]}>
        Departure Branch
      </Text>

      <View style={[styles.picker, { borderColor: colors.border }]}>
        <Picker
          selectedValue={journey.from}
          onValueChange={value => update('from', value)}>
          <Picker.Item label="Select Branch" value="" />

          {routes.map((item: any) => (
            <Picker.Item
              key={item._id}
              label={item.name}
              value={item._id}
            />
          ))}
        </Picker>
      </View>

      {/* DESTINATION */}

      <Text style={[styles.label, { color: colors.secondary }]}>
        Destination
      </Text>

      <View style={[styles.picker, { borderColor: colors.border }]}>
        <Picker
          enabled={!!journey.from}
          selectedValue={journey.destination}
          onValueChange={value => update('destination', value)}>
          <Picker.Item label="Select Destination" value="" />

          {routes
            .filter((r: any) => r._id !== journey.from)
            .map((item: any) => (
              <Picker.Item
                key={item._id}
                label={item.name}
                value={item._id}
              />
            ))}
        </Picker>
      </View>

      {/* TRIP */}

      <Text style={[styles.label, { color: colors.secondary }]}>
        Departure
      </Text>

      <View style={[styles.picker, { borderColor: colors.border }]}>
        <Picker
          enabled={!!journey.destination}
          selectedValue={journey.trip}
          onValueChange={value => update('trip', value)}>
          <Picker.Item label="Select Trip" value="" />

          {trips.map((trip: any) => (
            <Picker.Item
              key={trip._id}
              label={`${trip.departureTime} • ${trip.name}`}
              value={trip._id}
            />
          ))}
        </Picker>
      </View>

      {/* TRUCK */}

      <Text style={[styles.label, { color: colors.secondary }]}>
        Assigned Vehicle
      </Text>

      <View style={[styles.picker, { borderColor: colors.border }]}>
        <Picker
          enabled={!!journey.trip}
          selectedValue={journey.truck}
          onValueChange={value => update('truck', value)}>
          <Picker.Item label="Select Vehicle" value="" />

          {trucks.map((truck: any) => (
            <Picker.Item
              key={truck._id}
              label={`${truck.plate} • ${truck.driver}`}
              value={truck._id}
            />
          ))}
        </Picker>
      </View>

      {/* SUMMARY */}

      <View
        style={[
          styles.summary,
          {
            backgroundColor: colors.background,
          },
        ]}>

        <Text
          style={[
            styles.summaryTitle,
            { color: colors.text },
          ]}>
          Trip Summary
        </Text>

        <View style={styles.row}>
          <Text style={{ color: colors.secondary }}>
            Route
          </Text>

          <Text style={{ color: colors.text }}>
            {journey.from || '--'} → {journey.destination || '--'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={{ color: colors.secondary }}>
            Departure
          </Text>

          <Text style={{ color: colors.text }}>
            {journey.trip || '--'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={{ color: colors.secondary }}>
            Vehicle
          </Text>

          <Text style={{ color: colors.text }}>
            {journey.truck || '--'}
          </Text>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },

  label: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 13,
  },

  picker: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },

  summary: {
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
  },

  summaryTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
});
/* eslint-disable react-native/no-inline-styles */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { useTheme } from '../../../contexts/themeContext';

import SeatRenderer from './SeatRenderer';
import { SeatState } from './Seat';

import {
  VehicleLayout,
  HIACE_11,
  HIACE_14,
  BUS_25,
  BUS_33,
  BUS_49,
  BUS_51,
} from '../layouts/vehicleLayouts';

interface Props {
  vehicleType:
    | 'HIACE_11'
    | 'HIACE_14'
    | 'BUS_25'
    | 'BUS_33'
    | 'BUS_49'
    | 'BUS_51';

  seatStates: SeatState[];

  selectedSeat?: number;

  onSeatSelected: (seat: SeatState) => void;
}

const { width } = Dimensions.get('window');

const isTablet = width >= 768;

export default function SeatMap({
  vehicleType,
  seatStates,
  selectedSeat,
  onSeatSelected,
}: Props) {
  const { colors } = useTheme();

  const layout: VehicleLayout = useMemo(() => {
    switch (vehicleType) {
      case 'HIACE_11':
        return HIACE_11;

      case 'HIACE_14':
        return HIACE_14;

      case 'BUS_25':
        return BUS_25;

      case 'BUS_33':
        return BUS_33;

      case 'BUS_49':
        return BUS_49;

      case 'BUS_51':
        return BUS_51;

      default:
        return HIACE_11;
    }
  }, [vehicleType]);

  const available = seatStates.filter(
    s => s.status === 'available',
  ).length;

  const booked = seatStates.filter(
    s => s.status === 'booked',
  ).length;

  const reserved = seatStates.filter(
    s => s.status === 'reserved',
  ).length;

  const boarding = seatStates.filter(
    s => s.status === 'boarding',
  ).length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: isTablet ? 24 : 16,
        },
      ]}>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: isTablet ? 24 : 20,
          },
        ]}>
        Seat Map
      </Text>

      <Text
        style={{
          color: colors.secondary,
          marginBottom: 20,
          fontSize: isTablet ? 16 : 14,
        }}>
        {layout.name}
      </Text>

      <View style={styles.stats}>
        <Stat
          color="#2E7D32"
          value={available}
          label="Available"
        />

        <Stat
          color="#D32F2F"
          value={booked}
          label="Booked"
        />

        <Stat
          color="#F9A825"
          value={reserved}
          label="Reserved"
        />

        <Stat
          color="#7B1FA2"
          value={boarding}
          label="Boarded"
        />
      </View>

      <SeatRenderer
        layout={layout}
        seatStates={seatStates}
        selectedSeat={selectedSeat}
        onSeatPress={onSeatSelected}
      />

      <View style={styles.footer}>
        <Text
          style={{
            color: colors.secondary,
            fontSize: isTablet ? 16 : 14,
          }}>
          Selected Seat
        </Text>

        <Text
          style={{
            color: colors.text,
            fontWeight: '700',
            fontSize: isTablet ? 22 : 18,
          }}>
          {selectedSeat ?? '--'}
        </Text>
      </View>
    </View>
  );
}

interface StatProps {
  color: string;
  value: number;
  label: string;
}

function Stat({
  color,
  value,
  label,
}: StatProps) {
  return (
    <View style={styles.stat}>
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
          },
        ]}
      />

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
  },

  title: {
    fontWeight: '700',
    marginBottom: 6,
  },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 6,
  },

  statValue: {
    fontWeight: '700',
    fontSize: 16,
  },

  statLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  footer: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
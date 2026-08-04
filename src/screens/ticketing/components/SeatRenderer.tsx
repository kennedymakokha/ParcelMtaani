/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Seat from './Seat';
import { SeatRow, VehicleLayout } from './vehicleLayouts';

export interface SeatState {
  seatNo: number;
  status: 'available' | 'reserved' | 'booked' | 'selected' | 'boarding';

  passengerId?: string;
}

interface Props {
  layout: VehicleLayout;

  seatStates: SeatState[];

  selectedSeat?: number;

  onSeatPress: (seat: SeatState) => void;
}
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_PADDING = 102; // parent padding
const ROW_GAP = 12;

// 3 seat positions per row
const SEAT_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING - ROW_GAP * 2) / 3;
export default function SeatRenderer({
  layout,
  seatStates,
  selectedSeat,
  onSeatPress,
}: Props) {
  const getSeat = (seatNo: number): SeatState => {
    const found = seatStates.find(s => s.seatNo === seatNo);

    if (found) return found;

    return {
      seatNo,
      status: 'available',
    };
  };

  return (
    <View style={styles.container}>
  
      {layout.rows.map((row, index) => (
        <SeatRowRenderer
          key={index}
          row={row}
          selectedSeat={selectedSeat}
          getSeat={getSeat}
          onSeatPress={onSeatPress}
        />
      ))} 
    </View>
  );
}

interface RowProps {
  row: SeatRow;

  selectedSeat?: number;

  getSeat: (seat: number) => SeatState;

  onSeatPress: (seat: SeatState) => void;
}

function SeatRowRenderer({
  row,
  getSeat,
  onSeatPress,
  selectedSeat,
}: RowProps) {
  switch (row.type) {
    case 'driver':
      return (
        <View style={styles.driverRow}>
          {/* Seat 1 */}
          <Seat
            seat={getSeat(row.seats[0])}
            selected={selectedSeat === row.seats[0]}
            onPress={onSeatPress}
          />

          {/* Empty passenger space */}
          <View style={styles.driverGap} >
            <Text style={{ fontSize: 12, color: '#FFF' }}>1x</Text>
            </View>


          {/* Driver */}
          <View style={styles.driver}>
            <Text style={styles.driverText}>🚘</Text>
          </View>
        </View>
      );

    case '3-seat':
      return (
        <View style={styles.threeRow}>
          <Seat
            seat={getSeat(row.seats[0])}
            selected={selectedSeat === row.seats[0]}
            onPress={onSeatPress}
          />

          <View style={styles.aisle} />

          <Seat
            seat={getSeat(row.seats[1])}
            selected={selectedSeat === row.seats[1]}
            onPress={onSeatPress}
          />

          <Seat
            seat={getSeat(row.seats[2])}
            selected={selectedSeat === row.seats[2]}
            onPress={onSeatPress}
          />
        </View>
      );

    case '4-seat':
      return (
        <View style={styles.fourRow}>
          <Seat
            seat={getSeat(row.seats[0])}
            selected={selectedSeat === row.seats[0]}
            onPress={onSeatPress}
          />

          <Seat
            seat={getSeat(row.seats[1])}
            selected={selectedSeat === row.seats[1]}
            onPress={onSeatPress}
          />

          <View style={styles.aisle} />

          <Seat
            seat={getSeat(row.seats[2])}
            selected={selectedSeat === row.seats[2]}
            onPress={onSeatPress}
          />

          <Seat
            seat={getSeat(row.seats[3])}
            selected={selectedSeat === row.seats[3]}
            onPress={onSeatPress}
          />
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  front: {
    marginBottom: 20,
  },

  back: {
    marginTop: 20,
  },

  frontText: {
    fontWeight: '700',
    fontSize: 18,
  },

  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  driverGap: {
    
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: SEAT_SIZE / 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: ROW_GAP / 2,
    marginVertical: 5,
    elevation: 3,
  },

  threeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  fourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  driver: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  driverText: {
    fontSize: 28,
  },

  aisle: {
    width: 10,
  },
});

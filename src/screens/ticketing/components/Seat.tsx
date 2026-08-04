/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface SeatState {
  seatNo: number;

  status:
    | 'available'
    | 'reserved'
    | 'booked'
    | 'selected'
    | 'boarding';

  passengerId?: string;

  passengerName?: string;

  reservedUntil?: string;
}

interface Props {
  seat: SeatState;

  selected?: boolean;

  onPress: (seat: SeatState) => void;
}
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_PADDING = 102; // parent padding
const ROW_GAP = 12;

// 3 seat positions per row
const SEAT_SIZE = (SCREEN_WIDTH - HORIZONTAL_PADDING - ROW_GAP * 2) / 3;
export default function Seat({
  seat,
  selected,
  onPress,
}: Props) {

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    Animated.spring(scale, {
      toValue: selected ? 1.12 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

  }, [selected]);

  const seatColor = () => {

    if (selected)
      return '#1976D2';

    switch (seat.status) {

      case 'available':
        return '#2E7D32';

      case 'booked':
        return '#D32F2F';

      case 'reserved':
        return '#F9A825';

      case 'boarding':
        return '#7B1FA2';

      default:
        return '#2E7D32';

    }

  };

  const disabled =
    seat.status === 'booked';

  return (

    <TouchableWithoutFeedback
      disabled={disabled}
      onPress={() => onPress(seat)}>

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: seatColor(),
            transform: [{ scale }],
            opacity: disabled ? 0.75 : 1,
          },
        ]}>

        <Icon
          name="seat-passenger"
          size={24}
          color="#FFF"
        />

        <Text style={styles.number}>
          {seat.seatNo}
        </Text>

      </Animated.View>

    </TouchableWithoutFeedback>

  );

}

const styles = StyleSheet.create({

  container: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: SEAT_SIZE / 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: ROW_GAP / 2,
    marginVertical: 5,
    elevation: 3,
  },

  number: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },

});
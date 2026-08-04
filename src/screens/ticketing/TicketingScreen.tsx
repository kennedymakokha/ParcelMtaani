/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */

import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useSelector } from 'react-redux';

import SeatMap from './components/SeatMap';
import { RootState } from '../../../store';
import { useTheme } from '../../contexts/themeContext';
import DashboardHeader from './components/DashboardHeader';
import JourneyCard from './components/JourneyCard';
import { SeatState } from './components/Seat';
import PassengerDetailsModal from './components/PassengerDetailsModal';
import ReservationModal from './components/ReservationModal';
import PassengerBookingModal from './components/PassengerBookingModal';
import { Text } from 'react-native';

export default function TicketingScreen() {
  const { colors } = useTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const [search, setSearch] = useState('');

  const [selectedSeat, setSelectedSeat] = useState<SeatState | null>(null);

  const [journey, setJourney] = useState({
    from: '',
    destination: '',
    trip: '',
    truck: '',
    seat: '',
  });
  const [modal, setModal] = useState<
    'none' | 'booking' | 'details' | 'reservation'
  >('none');

  const [seatStates, setSeatStates] = useState<SeatState[]>([
    { seatNo: 1, status: 'available' },
    { seatNo: 2, status: 'available' },
    { seatNo: 3, status: 'booked', passengerId: 'P001' },
    { seatNo: 4, status: 'available' },
    { seatNo: 5, status: 'reserved' },
    { seatNo: 6, status: 'available' },
    { seatNo: 7, status: 'available' },
    { seatNo: 8, status: 'booked', passengerId: 'P002' },
    { seatNo: 9, status: 'available' },
    { seatNo: 10, status: 'available' },
    { seatNo: 11, status: 'available' },
    { seatNo: 12, status: 'available' },
    { seatNo: 13, status: 'available' },
    { seatNo: 14, status: 'available' },
  ]);

  const handleSeatPress = (seat: SeatState) => {
    setSelectedSeat(seat);

    setJourney(prev => ({
      ...prev,
      seat: String(seat.seatNo),
    }));

    switch (seat.status) {
      case 'available':
        setModal('booking');
        break;

      case 'booked':
        setModal('details');
        break;

      case 'reserved':
        setModal('reservation');
        break;

      case 'boarding':
        setModal('details');
        break;

      default:
        setModal('none');
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.tripCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Icon name="map-marker-path" size={26} color="#1976D2" />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text
              style={[
                styles.routeTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Nairobi → Kisumu
            </Text>

            <Text
              style={[
                styles.routeSubtitle,
                {
                  color: colors.secondary,
                },
              ]}
            >
              Toyota Hiace • KDL 345M • 08:30 AM
            </Text>
          </View>

          <View style={styles.seatBadge}>
            <Text style={styles.seatBadgeValue}>
              {seatStates.filter(s => s.status === 'available').length}
            </Text>

            <Text style={styles.seatBadgeLabel}>Free</Text>
          </View>
        </View>

        <SeatMap
          vehicleType="HIACE_11"
          seatStates={seatStates}
          selectedSeat={selectedSeat?.seatNo}
          onSeatSelected={handleSeatPress}
        />
      </ScrollView>

      <PassengerBookingModal
        visible={modal === 'booking'}
        seat={selectedSeat}
        journey={journey}
        onClose={() => setModal('none')}
        onBooked={async booking => {
          if (!selectedSeat) {
            return null;
          }

          try {
            // ===========================
            // TODO: Save booking to API
            // ===========================

            /*
      const ticket = await createTicket({
        seatNo: selectedSeat.seatNo,
        journey,
        ...booking,
      }).unwrap();
      */

            // Temporary mock ticket
            const ticket = {
              ticketNo: `TK${Date.now()}`,
              passenger: booking.passenger,
              luggage: booking.luggage,
              seat: selectedSeat.seatNo,
            };

            // ===========================
            // Update Seat Status
            // ===========================

            setSeatStates(prev =>
              prev.map(s =>
                s.seatNo === selectedSeat.seatNo
                  ? {
                      ...s,
                      status: 'booked',
                      passengerId: ticket.ticketNo,
                      passengerName: booking.passenger.fullName,
                    }
                  : s,
              ),
            );

            // ===========================
            // Print Passenger Ticket
            // ===========================

            if (booking.printTicket) {
              /*
        await printPassengerTicket(ticket);
        */
            }

            // ===========================
            // Print Luggage QR Tags
            // ===========================

            if (booking.printQr) {
              for (let i = 1; i <= booking.luggage; i++) {
                /*
          await printBagTag({
            bagNo: i,
            total: booking.luggage,
            seat: selectedSeat.seatNo,
            passenger: booking.passenger.fullName,
            ticketNo: ticket.ticketNo,
          });
          */
              }
            }

            setModal('none');

            return ticket;
          } catch (error) {
            console.log(error);
            return null;
          }
        }}
      />

      <PassengerDetailsModal
        visible={modal === 'details'}
        seat={selectedSeat}
        ticket={null}
        onClose={() => setModal('none')}
        onReprint={() => {}}
        onTransferSeat={() => {}}
        onCancelBooking={() => {}}
        onPrintQr={() => {}}
      />

      <ReservationModal
        visible={modal === 'reservation'}
        seat={selectedSeat}
        onClose={() => setModal('none')}
        onOverride={() => {
          setModal('booking');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 120,
  },

  tripCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  routeSubtitle: {
    marginTop: 4,
    fontSize: 15,
  },

  seatBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  seatBadgeValue: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 22,
  },

  seatBadgeLabel: {
    color: '#FFF',
    fontSize: 12,
  },
});

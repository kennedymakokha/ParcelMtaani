/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../../contexts/themeContext';
import { SeatState } from './Seat';

interface Passenger {
  fullName: string;
  phone: string;
  nationalId: string;
  gender: string;
}

interface Journey {
  from: string;
  destination: string;
  trip: string;
  truck: string;
}

interface Ticket {
  ticketNo: string;
  fare: number;
  paymentMethod: string;
  paid: boolean;
  luggage: number;
  boarded: boolean;
  passenger: Passenger;
  journey: Journey;
}

interface Props {
  visible: boolean;

  seat: SeatState | null;

  ticket: Ticket | null;

  onClose: () => void;

  onReprint: () => void;

  onTransferSeat: () => void;

  onCancelBooking: () => void;

  onPrintQr: () => void;
}

export default function PassengerDetailsModal({
  visible,
  seat,
  ticket,
  onClose,
  onReprint,
  onTransferSeat,
  onCancelBooking,
  onPrintQr,
}: Props) {
  const { colors } = useTheme();

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          {/* Header */}

          <View style={styles.header}>
            <View>
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                  },
                ]}
              >
                Passenger Details
              </Text>

              <Text
                style={{
                  color: colors.secondary,
                }}
              >
                Seat {seat?.seatNo}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Passenger */}

            <Text
              style={[
                styles.section,
                {
                  color: colors.text,
                },
              ]}
            >
              Passenger
            </Text>

            <View style={styles.infoCard}>
              <InfoRow title="Name" value={ticket?.passenger.fullName} />

              <InfoRow title="Phone" value={ticket?.passenger.phone} />

              <InfoRow
                title="National ID"
                value={ticket?.passenger.nationalId}
              />

              <InfoRow title="Gender" value={ticket?.passenger.gender} />
            </View>

            {/* Journey */}

            <Text
              style={[
                styles.section,
                {
                  color: colors.text,
                },
              ]}
            >
              Journey
            </Text>

            <View style={styles.infoCard}>
              <InfoRow title="From" value={ticket?.journey.from} />

              <InfoRow
                title="Destination"
                value={ticket?.journey.destination}
              />

              <InfoRow title="Trip" value={ticket?.journey.trip} />

              <InfoRow title="Vehicle" value={ticket?.journey.truck} />

              <InfoRow title="Seat" value={String(seat?.seatNo)} />
            </View>

            {/* Ticket */}

            <Text
              style={[
                styles.section,
                {
                  color: colors.text,
                },
              ]}
            >
              Ticket
            </Text>

            <View style={styles.infoCard}>
              <InfoRow title="Ticket No" value={ticket?.ticketNo} />

              <InfoRow title="Fare" value={`KES ${ticket?.fare}`} />

              <InfoRow
                title="Payment"
                value={ticket?.paid ? 'Paid' : 'Pending'}
              />

              <InfoRow title="Method" value={ticket?.paymentMethod} />
            </View>

            {/* Luggage */}

            <Text
              style={[
                styles.section,
                {
                  color: colors.text,
                },
              ]}
            >
              Luggage
            </Text>

            <View style={styles.infoCard}>
              <InfoRow title="Bags" value={String(ticket?.luggage)} />

              <InfoRow
                title="QR Tags"
                value={ticket && ticket.luggage > 0 ? 'Printed' : 'None'}
              />
            </View>
            {/* Boarding */}

            <Text
              style={[
                styles.section,
                {
                  color: colors.text,
                },
              ]}
            >
              Boarding
            </Text>

            <View style={styles.infoCard}>
              <InfoRow
                title="Status"
                value={ticket?.boarded ? 'Boarded' : 'Not Boarded'}
              />

              <InfoRow title="Seat" value={String(seat?.seatNo)} />
            </View>

            <View style={{ height: 25 }} />

            {/* Actions */}

            <TouchableOpacity style={styles.primaryButton} onPress={onReprint}>
              <Icon name="printer" size={20} color="#FFF" />

              <Text style={styles.primaryButtonText}>Reprint Ticket</Text>
            </TouchableOpacity>

            {ticket && ticket.luggage > 0 && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: '#00897B',
                  },
                ]}
                onPress={onPrintQr}
              >
                <Icon name="qrcode" size={20} color="#FFF" />

                <Text style={styles.primaryButtonText}>Print QR Tags</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: '#1976D2',
                },
              ]}
              onPress={onTransferSeat}
            >
              <Icon name="swap-horizontal" size={20} color="#FFF" />

              <Text style={styles.primaryButtonText}>Transfer Seat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: '#EF6C00',
                },
              ]}
            >
              <Icon name="account-edit" size={20} color="#FFF" />

              <Text style={styles.primaryButtonText}>Edit Passenger</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: '#C62828',
                },
              ]}
              onPress={onCancelBooking}
            >
              <Icon name="cancel" size={20} color="#FFF" />

              <Text style={styles.primaryButtonText}>Cancel Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            <View style={{ height: 10 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface InfoRowProps {
  title: string;
  value?: string;
}

function InfoRow({ title, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoTitle}>{title}</Text>

      <Text style={styles.infoValue}>{value ?? '--'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  card: {
    width: '100%',
    maxWidth: 650,
    maxHeight: '90%',
    borderRadius: 18,
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  infoTitle: {
    color: '#666',
    fontSize: 15,
  },

  infoValue: {
    fontWeight: '700',
    fontSize: 15,
  },

  primaryButton: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },

  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },

  closeButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#ECEFF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },

  closeButtonText: {
    color: '#444',
    fontWeight: '700',
    fontSize: 16,
  },
});

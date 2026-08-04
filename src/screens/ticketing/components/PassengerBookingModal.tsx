/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useSelector } from 'react-redux';

import { RootState } from '../../../../store';

import { useTheme } from '../../../contexts/themeContext';
import { useBusiness } from '../../../contexts/BusinessContext';

import { SeatState } from './Seat';

import { FormInput } from '../../../components/input.component';
import { PhoneInput } from '../../../components/phoneinput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { TertiaryButton } from '../../../components/TertiaryButton';

import Toast from '../../../components/toast';

import { COUNTRIES } from '../../../utils/countryCodes';

import { useTicketSubmit } from '../hooks/useTicketSubmit';

interface Journey {
  from: string;
  destination: string;
  trip: string;
  truck: string;
  seat: string;
  fare: number;
}

interface Passenger {
  fullName: string;
  phone: string;
  nationalId: string;
  gender: string;
}

interface Props {
  visible: boolean;

  seat: SeatState | null;

  journey: Journey;

  onClose: () => void;

  refetch: () => Promise<void>;

  selectedPrinterMac: string;
}

export default function PassengerBookingModal({
  visible,
  seat,
  journey,
  onClose,
  refetch,
  selectedPrinterMac,
}: Props) {
  const { colors } = useTheme();

  const { business } = useBusiness();

  const { user } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    submitTicket,
    msg,
    setMsg,
  } = useTicketSubmit();

  const [country, setCountry] =
    useState(COUNTRIES[0]);

  const [search, setSearch] =
    useState('');

  const [passenger, setPassenger] =
    useState<Passenger>({
      fullName: '',
      phone: '',
      nationalId: '',
      gender: '',
    });

  const [paymentMethod, setPaymentMethod] =
    useState<'Cash' | 'Mpesa' | 'Card'>(
      'Cash',
    );

  const [luggage, setLuggage] =
    useState(0);

  const [printTicket, setPrintTicket] =
    useState(true);

  const [printQr, setPrintQr] =
    useState(true);

  useEffect(() => {
    if (!visible) {
      setSearch('');

      setPassenger({
        fullName: '',
        phone: '',
        nationalId: '',
        gender: '',
      });

      setPaymentMethod('Cash');

      setLuggage(0);

      setPrintTicket(true);

      setPrintQr(true);
    }
  }, [visible]);

  const updatePassenger = (
    key: keyof Passenger,
    value: string,
  ) => {
    setPassenger(prev => ({
      ...prev,
      [key]: value,
    }));
  };
    const handleBookSeat = async () => {
    if (!seat) {
      return;
    }

    if (!passenger.fullName.trim()) {
      setMsg({
        msg: 'Passenger name is required',
        state: 'error',
      });
      return;
    }

    await submitTicket({
      passenger,
      journey,
      seat,
      luggage,
      paymentMethod,
      phoneNumber: passenger.phone,
      selectedPrinterMac,
      business,
      user,
      printTicket,
      printQr,
      refetch,
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          style={styles.overlay}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
              },
            ]}>
            {/* HEADER */}

            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.text,
                    },
                  ]}>
                  Book Passenger
                </Text>

                <Text
                  style={{
                    color: colors.secondary,
                  }}>
                  Seat {seat?.seatNo ?? '--'}
                </Text>
              </View>

              <TouchableOpacity onPress={onClose}>
                <Icon
                  name="close"
                  size={28}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {/* SEARCH */}

              <FormInput
                label="Search Passenger"
                placeholder="Phone or ID Number"
                value={search}
                onChangeText={setSearch}
              />

              {/* PASSENGER */}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Passenger Details
              </Text>

              <FormInput
                label="Full Name"
                value={passenger.fullName}
                onChangeText={v =>
                  updatePassenger(
                    'fullName',
                    v,
                  )
                }
              />

              <PhoneInput
                label="Phone Number"
                value={passenger.phone}
                country={country}
                onChangeCountry={setCountry}
                onChange={phone =>
                  updatePassenger(
                    'phone',
                    phone,
                  )
                }
              />

              <FormInput
                label="National ID"
                value={passenger.nationalId}
                onChangeText={v =>
                  updatePassenger(
                    'nationalId',
                    v,
                  )
                }
              />

              <FormInput
                label="Gender"
                value={passenger.gender}
                onChangeText={v =>
                  updatePassenger(
                    'gender',
                    v,
                  )
                }
              />

              {/* JOURNEY */}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Journey
              </Text>

              <View
                style={[
                  styles.summaryCard,
                  {
                    borderColor:
                      colors.border,
                  },
                ]}>
                <Row
                  label="Route"
                  value={`${journey.from} → ${journey.destination}`}
                />

                <Row
                  label="Vehicle"
                  value={journey.truck}
                />

                <Row
                  label="Trip"
                  value={journey.trip}
                />

                <Row
                  label="Seat"
                  value={String(
                    seat?.seatNo,
                  )}
                />

                <Row
                  label="Fare"
                  value={`KES ${journey.fare}`}
                />
              </View>

              {/* LUGGAGE */}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Luggage
              </Text>

              <View style={styles.counterRow}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setLuggage(prev =>
                      Math.max(0, prev - 1),
                    )
                  }>
                  <Icon
                    name="minus"
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.counterValue,
                    {
                      color: colors.text,
                    },
                  ]}>
                  {luggage}
                </Text>

                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() =>
                    setLuggage(prev => prev + 1)
                  }>
                  <Icon
                    name="plus"
                    size={20}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>

              {/* PAYMENT */}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Payment Method
              </Text>

              <View style={styles.paymentRow}>
                {['Cash', 'Mpesa', 'Card'].map(
                  method => (
                    <TouchableOpacity
                      key={method}
                      onPress={() =>
                        setPaymentMethod(
                          method as any,
                        )
                      }
                      style={[
                        styles.paymentChip,
                        paymentMethod ===
                          method && {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}>
                      <Text
                        style={{
                          color:
                            paymentMethod ===
                            method
                              ? '#FFF'
                              : colors.text,
                          fontWeight:
                            '700',
                        }}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* PRINT */}

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                  },
                ]}>
                Printing
              </Text>

              <View style={styles.switchRow}>
                <Text
                  style={{
                    color: colors.text,
                  }}>
                  Print Ticket
                </Text>

                <Switch
                  value={printTicket}
                  onValueChange={
                    setPrintTicket
                  }
                />
              </View>

              <View style={styles.switchRow}>
                <Text
                  style={{
                    color: colors.text,
                  }}>
                  Print Bag Tags
                </Text>

                <Switch
                  value={printQr}
                  onValueChange={setPrintQr}
                />
              </View>
                            <View style={{ height: 30 }} />

              <PrimaryButton
                title="Book Ticket"
                onPress={handleBookSeat}
              />

              <View style={{ height: 12 }} />

              <TertiaryButton
                title="Cancel"
                onPress={onClose}
                color={colors.secondary}
              />

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {msg.msg && (
        <Toast
          msg={msg.msg}
          state={msg.state}
          setMsg={setMsg}
        />
      )}
    </>
  );
}

/* -------------------------------- */
/* Helper Component                 */
/* -------------------------------- */

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>
        {label}
      </Text>

      <Text style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    borderRadius: 18,
    maxHeight: '94%',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 14,
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  rowLabel: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },

  rowValue: {
    fontSize: 15,
    fontWeight: '700',
  },

  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },

  counterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  counterValue: {
    width: 90,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
  },

  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },

  paymentChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#ECEFF1',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});
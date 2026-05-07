/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';

import { useTheme } from '../contexts/themeContext';
import { FormInput } from '../components/input.component';
import { PhoneInput } from '../components/phoneinput';
import { PrinterSelectionModal } from '../modals/printerSelect.model';
import { SectionHeader } from '../components/ui/sectionHeader';
import Toast from '../components/toast';

import { COUNTRIES } from '../utils/countryCodes';
import { ParcelFormState } from '../../types';

import { useRegisterParcelMutation } from '../services/apis/parcel.api';
import { buildReceiptText } from '../services /recieptBuilder';
import { printToPrinter } from '../services /printer.service';
import Keypad from '../components/keyPad';
import { useMpesapayMutation } from '../services/apis/mpesa.api.ts';

export default function ParcelIntakeScreen({ onClose, refetch }: any) {
  const { colors } = useTheme();
  const [lipaNaMpesa, { isLoading: paying }] = useMpesapayMutation();
  const { user } = useSelector((state: any) => state.auth);
  const pickups = useSelector((state: any) => state.pickups.pickups);

  const [country, setCountry] = useState(COUNTRIES[0]);

  const [pickup, setPickup] = useState<any>('');

  const [selectedPrinterMac, setSelectedPrinterMac] = useState<string | null>(
    null,
  );

  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });

  const [postParcel, { isLoading: submitting }] = useRegisterParcelMutation();

  // =========================
  // PAYMENT STATES
  // =========================

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MPESA'>('CASH');

  const [isSplitPayment, setIsSplitPayment] = useState(false);

  const [activeField, setActiveField] = useState<
    'PHONE' | 'CASH_AMT' | 'MPESA_AMT'
  >('CASH_AMT');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountGiven, setAmountGiven] = useState('');
  const [mpesaPortion, setMpesaPortion] = useState('');

  // =========================
  // FORM
  // =========================

  const [formData, setFormData] = useState<ParcelFormState>({
    sender: {
      name: '',
      phone: '',
      address: '',
    },

    receiver: {
      name: '',
      phone: '',
      address: '',
    },

    parcel: {
      weight: '',
      instructions: '',
      destination: 'pickup',
      pickup,
      code: '',
      sentFrom: user.pickup?._id || '',
      price: '',
      fragile: false,
    },
  });

  // =========================
  // TOTALS
  // =========================

  const parcelTotal = Number(formData.parcel.price || 0);

  const paymentTotals = useMemo(() => {
    const cash = parseFloat(amountGiven) || 0;

    const mpesa =
      isSplitPayment || paymentMethod === 'MPESA'
        ? parseFloat(mpesaPortion) || 0
        : 0;

    const totalPaid = cash + mpesa;

    const remaining = parcelTotal - totalPaid;

    const netNeededAfterMpesa = Math.max(0, parcelTotal - mpesa);

    const change = cash > netNeededAfterMpesa ? cash - netNeededAfterMpesa : 0;

    return {
      totalPaid,
      remaining,
      change,
    };
  }, [amountGiven, mpesaPortion, parcelTotal, isSplitPayment, paymentMethod]);

  // =========================
  // LOAD PRINTER
  // =========================

  useEffect(() => {
    const loadPrinter = async () => {
      const saved = await AsyncStorage.getItem('SELECTED_PRINTER_MAC');

      if (saved) {
        setSelectedPrinterMac(saved);
      }
    };

    loadPrinter();
  }, []);

  // =========================
  // UPDATE FIELD
  // =========================

  const updateField = <
    K extends keyof ParcelFormState,
    F extends keyof ParcelFormState[K],
  >(
    section: K,
    field: F,
    value: any,
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // =========================
  // KEYPAD
  // =========================

  const handleKeypadChange = (v: string) => {
    if (activeField === 'PHONE') {
      setPhoneNumber(v);
    } else if (activeField === 'MPESA_AMT') {
      setMpesaPortion(v);
    } else {
      setAmountGiven(v);
    }
  };

  // =========================
  // BLUETOOTH
  // =========================

  const requestBluetoothPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,

        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

      const scanGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;

      const connectGranted =
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED;

      return scanGranted && connectGranted;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  useEffect(() => {
    const init = async () => {
      await requestBluetoothPermissions();
    };

    init();
  }, []);

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {
    if (!selectedPrinterMac) {
      setShowPrinterModal(true);
      return;
    }

    const sixDigitNumber = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const currentPickup = pickups.find((p: any) => p._id === pickup);

    const pickupShortCode = currentPickup?.short_code || '';
    const pickupFullName = currentPickup?.pickup_name || '';

    const receiptNo = `INV${sixDigitNumber}`;

    let mpesaResponse: any = null;

    const updatedFormData = {
      ...formData,

      payment: {
        method: isSplitPayment ? 'SPLIT' : paymentMethod,

        cash: paymentMethod === 'CASH' ? parcelTotal : Number(amountGiven || 0),

        mpesa:
          paymentMethod === 'MPESA' ? parcelTotal : Number(mpesaPortion || 0),

        phone: phoneNumber,

        mpesaData: null,
      },

      parcel: {
        ...formData.parcel,

        pickup,

        code: `${pickupShortCode}-${sixDigitNumber}`,
      },
    };

    try {
      /**
       * =========================
       * RUN MPESA FIRST
       * =========================
       */
      if (paymentMethod === 'MPESA' || isSplitPayment) {
        mpesaResponse = await lipaNaMpesa({
          phone_number: phoneNumber,
          amount:
            paymentMethod === 'MPESA' ? parcelTotal : Number(mpesaPortion || 0),

          pickup_id: user.pickup?._id,
        }).unwrap();

        updatedFormData.payment.mpesaData = mpesaResponse;

        if (!mpesaResponse || mpesaResponse.ResponseCode !== 0) {
          throw new Error(mpesaResponse?.message || 'Mpesa payment failed');
        }
      }

      /**
       * =========================
       * BUILD RECEIPT
       * =========================
       */
      const receiptText = buildReceiptText({
        receiptNo,
        invoiceId: receiptNo,

        sender: formData.sender,
        reciever: formData.receiver,
        parcel: updatedFormData.parcel,

        method: isSplitPayment ? 'SPLIT' : paymentMethod,

        paid: parcelTotal,

        paidCash:
          paymentMethod === 'CASH' ? parcelTotal : Number(amountGiven || 0),

        paidMpesa:
          paymentMethod === 'MPESA' ? parcelTotal : Number(mpesaPortion || 0),

        mpesaData: {
          receiptNumber: mpesaResponse?.MpesaReceiptNumber,

          transactionDate: new Date(),

          phoneNumber: mpesaResponse?.phone_number || phoneNumber,
        },

        phoneNumber,

        totals: {
          finalTotal: parcelTotal,
        },

        from: `${user?.pickup?.pickup_name || ''}`,

        pickupName: pickupFullName,

        user: {
          name: user?.name || 'Admin',
        },
      });

      const qrData = JSON.stringify({
        id: receiptNo,

        reciever: formData.receiver,

        pickupName: pickupFullName,

        code: `${pickupShortCode}-${sixDigitNumber}`,

        from: `${user?.pickup?.pickup_name || ''}`,
      });

      /**
       * =========================
       * FORCE PRINT SUCCESS
       * =========================
       * Since payment is already done,
       * DO NOT navigate away until print succeeds.
       */

      let printed = false;
      let attempts = 0;
      const MAX_RETRIES = 5;

      while (!printed && attempts < MAX_RETRIES) {
        attempts++;

        try {
          printed = await printToPrinter(
            selectedPrinterMac,
            pickupShortCode,
            receiptText,
            qrData,
            sixDigitNumber,
            true,
            receiptNo,
          );

          if (!printed) {
            throw new Error('Printing failed');
          }
        } catch (printErr) {
          console.log(`Print attempt ${attempts} failed`, printErr);

          if (attempts >= MAX_RETRIES) {
            setMsg({
              msg: 'Payment received but printing failed. Please reconnect printer and retry.',

              state: 'error',
            });

            return;
          }

          // wait before retry
          await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));
        }
      }

      /**
       * =========================
       * ONLY POST AFTER PRINT SUCCESS
       * =========================
       */
      await postParcel(updatedFormData).unwrap();

      await refetch();

      setMsg({
        msg: 'Parcel registered and receipt printed successfully',

        state: 'success',
      });

      await onClose();
    } catch (error: any) {
      console.log(error);

      setMsg({
        msg:
          error?.data?.message || error?.message || 'An unknown error occurred',

        state: 'error',
      });
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingBottom: 96,
        paddingTop: 20,
      }}
    >
      <SectionHeader title="New parcel" />

      {/* ========================= */}
      {/* SENDER */}
      {/* ========================= */}

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Sender Details
        </Text>

        <FormInput
          label="Sender Name"
          value={formData.sender.name}
          onChangeText={t => updateField('sender', 'name', t)}
        />

        <PhoneInput
          label="Sender Phone"
          value={formData.sender.phone}
          country={country}
          onChangeCountry={setCountry}
          onChange={t => updateField('sender', 'phone', t)}
        />
      </View>

      {/* ========================= */}
      {/* RECEIVER */}
      {/* ========================= */}

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
          }}
        >
          Receiver Details
        </Text>

        <FormInput
          label="Recipient Name"
          value={formData.receiver.name}
          onChangeText={t => updateField('receiver', 'name', t)}
        />

        <PhoneInput
          label="Recipient Phone"
          value={formData.receiver.phone}
          country={country}
          onChangeCountry={setCountry}
          onChange={t => updateField('receiver', 'phone', t)}
        />
      </View>

      {/* ========================= */}
      {/* PARCEL */}
      {/* ========================= */}

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            Parcel Details
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: colors.text,
                marginRight: 8,
              }}
            >
              Fragile
            </Text>

            <Switch
              value={formData.parcel.fragile}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,

                  parcel: {
                    ...prev.parcel,
                    fragile: value,
                  },
                }))
              }
            />
          </View>
        </View>

        <FormInput
          label="Weight (kg)"
          keyboardType="numeric"
          value={formData.parcel.weight}
          onChangeText={t => updateField('parcel', 'weight', t)}
        />

        <FormInput
          label="Price (KES)"
          keyboardType="numeric"
          value={formData.parcel.price}
          onChangeText={t => updateField('parcel', 'price', t)}
        />

        <FormInput
          label="Special Instructions"
          multiline
          value={formData.parcel.instructions}
          onChangeText={t => updateField('parcel', 'instructions', t)}
        />

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
          }}
        >
          <Picker selectedValue={pickup} onValueChange={v => setPickup(v)}>
            {pickups
              ?.filter((pickup: any) => pickup._id !== user.pickup?._id)
              .map((pickup: any) => (
                <Picker.Item
                  key={pickup._id}
                  label={pickup.pickup_name}
                  value={pickup._id}
                />
              ))}
          </Picker>
        </View>
      </View>

      {/* ========================= */}
      {/* PAYMENT */}
      {/* ========================= */}

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Payment
        </Text>

        {/* TOTAL */}

        <View
          style={{
            backgroundColor: colors.background,
            padding: 20,
            borderRadius: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              color: colors.text,
            }}
          >
            TOTAL DUE
          </Text>

          <Text
            style={{
              color: colors.primary,
              fontSize: 34,
              fontWeight: 'bold',
            }}
          >
            KES {parcelTotal.toLocaleString()}
          </Text>
        </View>

        {/* SPLIT */}

        <TouchableOpacity
          onPress={() => {
            setIsSplitPayment(!isSplitPayment);

            setActiveField(!isSplitPayment ? 'PHONE' : 'CASH_AMT');
          }}
          style={{
            borderWidth: 1,
            borderColor: isSplitPayment ? colors.primary : colors.border,

            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: '600',
            }}
          >
            Split Cash & M-Pesa
          </Text>
        </TouchableOpacity>

        {/* METHODS */}

        {!isSplitPayment && (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.background,

              padding: 4,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setPaymentMethod('CASH');

                setActiveField('CASH_AMT');
              }}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                backgroundColor:
                  paymentMethod === 'CASH' ? '#3b82f6' : 'transparent',

                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                CASH
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPaymentMethod('MPESA');

                setActiveField('PHONE');

                setMpesaPortion(parcelTotal.toString());
              }}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 10,
                backgroundColor:
                  paymentMethod === 'MPESA' ? '#22c55e' : 'transparent',

                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                M-PESA
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MPESA */}

        {(paymentMethod === 'MPESA' || isSplitPayment) && (
          <>
            <TouchableOpacity
              onPress={() => setActiveField('PHONE')}
              style={{
                borderWidth: 2,
                borderColor:
                  activeField === 'PHONE' ? colors.primary : colors.border,

                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                }}
              >
                +254 {phoneNumber || '7...'}
              </Text>
            </TouchableOpacity>

            {isSplitPayment && (
              <TouchableOpacity
                onPress={() => setActiveField('MPESA_AMT')}
                style={{
                  borderWidth: 2,
                  borderColor:
                    activeField === 'MPESA_AMT'
                      ? colors.primary
                      : colors.border,

                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                  }}
                >
                  M-PESA: KES {mpesaPortion || '0'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* CASH */}

        {(paymentMethod === 'CASH' || isSplitPayment) && (
          <TouchableOpacity
            onPress={() => setActiveField('CASH_AMT')}
            style={{
              borderWidth: 2,
              borderColor:
                activeField === 'CASH_AMT' ? colors.primary : colors.border,

              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: colors.text,
              }}
            >
              CASH: KES {amountGiven || '0'}
            </Text>
          </TouchableOpacity>
        )}

        {/* CHANGE */}

        {paymentTotals.change > 0 && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#f97316',
              padding: 16,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
              }}
            >
              CHANGE: KES {paymentTotals.change.toFixed(2)}
            </Text>
          </View>
        )}

        {/* KEYPAD */}

        <Keypad
          value={
            activeField === 'PHONE'
              ? phoneNumber
              : activeField === 'MPESA_AMT'
              ? mpesaPortion
              : amountGiven
          }
          onChange={handleKeypadChange}
        />
      </View>

      {/* ========================= */}
      {/* TOAST */}
      {/* ========================= */}

      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}

      {/* ========================= */}
      {/* SUBMIT */}
      {/* ========================= */}

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: selectedPrinterMac ? colors.primary : colors.error,

          padding: 18,
          borderRadius: 12,
        }}
      >
        {(paymentMethod === 'MPESA' || isSplitPayment ? paying : submitting) ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 16,
            }}
          >
            {selectedPrinterMac
              ? 'Generate & Print Receipt'
              : 'Select Printer First'}
          </Text>
        )}
      </TouchableOpacity>

      {/* ========================= */}
      {/* PRINTER MODAL */}
      {/* ========================= */}

      <PrinterSelectionModal
        visible={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
        onSelect={mac => {
          setSelectedPrinterMac(mac);

          AsyncStorage.setItem('SELECTED_PRINTER_MAC', mac);

          setShowPrinterModal(false);
        }}
      />
    </ScrollView>
  );
}

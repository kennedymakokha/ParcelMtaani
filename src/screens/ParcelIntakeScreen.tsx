/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import ParcelIntakeScreen from '../modals/parcelIntekeModal';
import {
  useDispatchParcelMutation,
  useFetchparcelQuery,
} from '../services/apis/parcel.api';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import { useGetTrucksQuery } from '../services/apis/trucks.api';
import { Truck } from '../../types';
import Toast from '../components/toast';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { Fab } from '../components/buttons/fab';
import { useSocket } from '../contexts/socketContext';
import { RootState } from '../../store';
import { ParcelCard } from '../components/parcekCard';
import { useQrPrinter } from '../hooks/useQrPrinter';

// 1. 👇 Import your thermal text printing service or library module

import { usePrinter } from '../hooks/usePrinter';
import { encryptQR, signQR } from '../hooks/useParcelSubmit';
import { printToPrinter } from '../services /printer.service';
import { buildReceiptText } from '../services /recieptBuilder';

export default function DispatchToTrackScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const [showReprintModal, setShowReprintModal] = useState(false);
  const [targetParcel, setTargetParcel] = useState<any | null>(null);

  const [selectedParcels, setSelectedParcels] = useState<any[]>([]);
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const handleToastMsg = (message: string) =>
    setMsg(prev => ({
      msg: message,
      state: message ? prev.state : '',
    }));
  const { user } = useSelector((state: any) => state.auth);
  const pickupState = useSelector(
    (state: RootState) => state.pickupEvents.lastEvent,
  );
  const { socket } = useSocket();
  const [dispatchParcel, { isLoading: dispatching }] =
    useDispatchParcelMutation();
  const { data: trucks, isFetching: fetchingTrucks } = useGetTrucksQuery({
    page: 1,
    limit: 1000,
    search,
  });
  const Vehicles = trucks?.trucks || [];
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );

  const isPickupShut = pickupState === 'pickup_shut';

  const isNotPaid =
    currentPickup && Object.keys(currentPickup).length > 0
      ? currentPickup.paid === false || currentPickup.paid === 'false'
      : false;

  const isInactive = isPickupShut || isNotPaid;
  const { data, isLoading, refetch } = useFetchparcelQuery({
    limit: 10,
    sentFrom: user?.pickup?._id,
    page: 1,
    status: 'Pending Dispatch',
    search,
  });
  const parcels = data?.parcels || [];

  const [vehicleReg, setVehicleReg] = useState('');

  const { selectedPrinterMac } = usePrinter();

  // 2. 👇 Pass the mac straight from your local async storage state wire
  const { setQrPrintData, printQr } = useQrPrinter({
    selectedPrinterMac,
    onClose: () => setShowReprintModal(false),
    setMsg: (toastState: any) => setMsg(toastState),
  });

  const toggleSelect = (item: any) => {
    if (item.status !== 'Pending Dispatch') return;
    setSelectedParcels(prev =>
      prev.includes(item._id)
        ? prev.filter(id => id !== item._id)
        : [...prev, item._id],
    );
  };

  useEffect(() => {
    if (currentPickup) {
      refetch();
    }
  }, [currentPickup, refetch]);
  useEffect(() => {
    if (!socket) return;

    const onCanceledParcel = async (parcel: any) => {
      console.log(parcel);
      await refetch();
    };

    socket.on('Parcel-change', onCanceledParcel);
    return () => {
      socket.off('Parcel-change', onCanceledParcel);
    };
  }, [socket, refetch]);

  // 3. 👇 FIXED: Properly format data structure context and fire print job
  const triggerReprintQr = async () => {
    if (!selectedPrinterMac) {
      setMsg({ msg: 'Please select a hardware printer first', state: 'error' });
      return;
    }
    if (!targetParcel) return;

    const qrPayload = {
      code: targetParcel.code, // MUST stay plain
      data: encryptQR({
        id: targetParcel.receiptNo,
        receiver: targetParcel.receiver_phone,
        receivername: targetParcel.receiver_name,
        pickupName: currentPickup?.pickup_name,
        from: user?.pickup?.pickup_name || '',
      }),
      signature: signQR(targetParcel.code, targetParcel.receiptNo),
    };

    const qrData = JSON.stringify(qrPayload);
    // Set layout matching expected shape inside useQrPrinter hook state container
    await setQrPrintData({
      qrData, // falls back to string code identifier
      parcelCode: targetParcel.code,
    });

    // Execute the bound function implementation loop
    setTimeout(() => {
      printQr();
    }, 100);
  };

  // 4. 👇 NEW: Full structured text receipt printing pipeline execution block
  const triggerReprintReceipt = async () => {
    if (!selectedPrinterMac) {
      setMsg({ msg: 'Please select a hardware printer first', state: 'error' });
      return;
    }
    if (!targetParcel) return;

    try {
      setShowReprintModal(false);

      const receiptText = buildReceiptText({
        receiptNo: targetParcel.code,
        printDate: targetParcel.createdAt,
        from: user?.pickup?.pickup_name || '',
        pickupName: currentPickup?.pickup_name,
        sender: {
          name: targetParcel.sender_name,
          phone: targetParcel.sender_phone,
        },
        reciever: {
          name: targetParcel.receiver_name,
          phone: targetParcel.receiver_phone,
        },
        parcel: {
          instructions: targetParcel.instructions,
          price: targetParcel.price,
          weight: targetParcel.weight,
        },
        method: targetParcel.payment_method || 'CASH',
        paid: targetParcel.price,
        phoneNumber: targetParcel.sender_phone,
        business: user.business,
      });

      await printToPrinter(selectedPrinterMac, receiptText);
      setMsg({ msg: 'Receipt printed successfully', state: 'success' });
    } catch (error) {
      console.log(error);
      setMsg({ msg: 'Failed to reprint full receipt text', state: 'error' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}>
      {/* Search Bar */}
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          borderRadius: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.text,
          marginBottom: 20,
        }}
        placeholder="Search by pickup or code..."
        placeholderTextColor={colors.secondary}
        value={search}
        onChangeText={setSearch}
      />
      {isLoading ? (
        <Text style={{ color: colors.secondary, textAlign: 'center' }}>
          Loading parcels...
        </Text>
      ) : (
        <FlatList
          data={parcels}
          keyExtractor={item => item._id}
          renderItem={({ item }: { item: any }) => (
            <ParcelCard
              item={item}
              colors={colors}
              onPress={() => toggleSelect(item)}
              onDoublePress={() => {
                setTargetParcel(item);
                setShowReprintModal(true);
              }}
            />
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.secondary, textAlign: 'center' }}>
              No parcels found
            </Text>
          }
        />
      )}
      {msg.msg && (
        <Toast setMsg={handleToastMsg} msg={msg.msg} state={msg.state} />
      )}

      {/* Track Button */}
      {selectedParcels.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowTrackModal(true)}
          style={{
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 8,
            marginTop: 12,
          }}
        >
          <Text
            style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}
          >
            Track Selected ({selectedParcels.length})
          </Text>
        </TouchableOpacity>
      )}

      {!isInactive && (
        <Fab
          onPress={() => {
            setShowIntakeModal(true);
          }}
        />
      )}

      {/* Intake Modal */}
      <Modal visible={showIntakeModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingTop: 16,
              paddingHorizontal: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowIntakeModal(false)}
              className="flex items-center justify-center p-1 rounded-md"
              style={{
                backgroundColor: colors.error,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ParcelIntakeScreen
            refetch={refetch}
            onClose={() => {
              setShowIntakeModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Track Modal */}
      <Modal visible={showTrackModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: '#000000aa',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 20,
              maxHeight: '80%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Vehicle & Driver Details
              </Text>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {fetchingTrucks ? 'Loading trucks...' : 'Assign Truck'}
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <Picker
                    selectedValue={vehicleReg}
                    onValueChange={value => setVehicleReg(value)}
                    style={{ color: colors.text }}
                  >
                    <Picker.Item label="Select Driver" value="" />
                    {Vehicles.map((s: Truck) => (
                      <Picker.Item key={s._id} label={s.plate} value={s._id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <PrimaryButton
                title={dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
                onPress={async () => {
                  await dispatchParcel({
                    parcelIds: selectedParcels,
                    truckId: vehicleReg,
                  });
                  setShowTrackModal(false);
                  setSelectedParcels([]);
                  await refetch();
                  setMsg({
                    msg: 'Parcels dispatched successfully',
                    state: 'success',
                  });
                }}
                loading={dispatching || !vehicleReg}
              />
              <SecondaryButton
                onPress={() => setShowTrackModal(false)}
                title="Cancel"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* REPRINT SELECTION MODAL */}
      <Modal
        visible={showReprintModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReprintModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            padding: 24,
          }}
          onPress={() => setShowReprintModal(false)}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 24,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              Reprint Document
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.secondary,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              Code: {targetParcel?.code || 'N/A'}
            </Text>

            <View style={{ gap: 12 }}>
              <PrimaryButton
                title="Reprint QR Code"
                onPress={triggerReprintQr}
              />
              <PrimaryButton
                title="Reprint Receipt"
                onPress={triggerReprintReceipt}
              />
              <SecondaryButton
                title="Close Menu"
                onPress={() => setShowReprintModal(false)}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

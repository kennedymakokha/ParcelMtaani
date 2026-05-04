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

export default function DispatchToTrackScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [showIntakeModal, setShowIntakeModal] = useState(true);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState<any[]>([]);
  const [msg, setMsg] = useState({ msg: '', state: '' });
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
  const { data, isLoading, refetch } = useFetchparcelQuery({
    limit: 10,
    sentFrom: currentPickup._id,
    page: 1,
    status: 'Pending Dispatch',
    search,
  });
  const parcels = data?.parcels || [];

  const [vehicleReg, setVehicleReg] = useState('');

  const toggleSelect = (item: any) => {
    if (item.status !== 'Pending Dispatch') return;
    setSelectedParcels(prev =>
      prev.includes(item._id)
        ? prev.filter(id => id !== item._id)
        : [...prev, item._id],
    );
  };

  const renderParcel = ({ item }: { item: any }) => {
    const isSelected = selectedParcels.includes(item._id);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={{
          backgroundColor: isSelected ? colors.primary + '20' : colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? colors.primary : 'transparent',
          shadowOpacity: 0.1,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
          From: {item.sentFrom?.pickup_name}
        </Text>

        <Text style={{ color: colors.secondary, marginTop: 4 }}>
          Pickup: {item.pickup?.pickup_name}
        </Text>

        <Text
          style={{
            color: colors.primary,
            marginTop: 4,
            fontWeight: '500',
          }}
        >
          Code: {item.code}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontWeight: '600',
            color:
              item.status === 'Delivered'
                ? colors.success
                : item.status === 'In Transit'
                ? colors.warning
                : colors.danger,
          }}
        >
          Status: {item.status}
        </Text>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    if (currentPickup) {
      refetch();
    }
  }, [currentPickup, refetch]);
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
          renderItem={renderParcel}
          ListEmptyComponent={
            <Text style={{ color: colors.secondary, textAlign: 'center' }}>
              No parcels found
            </Text>
          }
        />
      )}
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
      {/* Track Button (enabled if pending selected) */}
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

      <Fab
        onPress={() => {
          setShowIntakeModal(true);
          console.log('opening');
        }}
      />

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
              maxHeight: '80%', // ✅ prevents overflow
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

              {/* Truck Selector */}
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
                    overflow: 'hidden', // ✅ fixes Android clipping
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

              {/* Buttons */}
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
                disabled={dispatching || !vehicleReg}
              />
              <SecondaryButton
                onPress={() => setShowTrackModal(false)}
                title="Cancel"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

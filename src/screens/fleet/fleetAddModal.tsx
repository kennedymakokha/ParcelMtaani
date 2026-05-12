/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useTheme } from '../../contexts/themeContext';
import { useGetUsersQuery } from '../../services/apis/auth.api';
import {
  useCreateTruckMutation,
  useEditTruckMutation,
} from '../../services/apis/trucks.api';

import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import Toast from '../../components/toast';
import { FormInput } from '../../components/input.component';
import { PhoneInput } from '../../components/phoneinput';
import { COUNTRIES } from '../../utils/countryCodes';
import { SectionHeader } from '../../components/ui/sectionHeader';

interface Staff {
  _id: string;
  name: string;
  phone_number?: string;
  identification_No?: string;
}

interface TruckFormModalProps {
  visible: boolean;
  onClose: () => void;
  editingTruck?: any;
  item: any;
  setItem: React.Dispatch<any>;
}

export default function TruckFormModal({
  visible,
  onClose,
  editingTruck,
  item,
  setItem,
}: TruckFormModalProps) {
  const { colors } = useTheme();

  const [country, setCountry] = useState(COUNTRIES[0]);

  const [msg, setMsg] = useState({
    msg: '',
    state: '',
  });

  const [driverQuery, setDriverQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewDriver, setIsNewDriver] = useState(false);

  const { data } = useGetUsersQuery({
    page: 1,
    role: 'driver',
  });

  const drivers: Staff[] = data?.users || [];

  const [createTruck, { isLoading }] =
    useCreateTruckMutation();

  const [updateTruck, { isLoading: isUpdating }] =
    useEditTruckMutation();

  // FILTER DRIVERS
  const filteredDrivers = driverQuery
    ? drivers.filter(d =>
        d.name
          ?.toLowerCase()
          .includes(driverQuery.toLowerCase()),
      )
    : drivers;

  // RESET + POPULATE EDIT FORM
  useEffect(() => {
    if (!visible) return;

    if (editingTruck) {
      setItem({
        plate: editingTruck.plate || '',
        model: editingTruck.model || '',
        capacity: editingTruck.capacity || '',

        // DRIVER
        driverId: editingTruck.driverId?._id || '',
        driverPhone:
          editingTruck.driverId?.phone_number || '',
        driverIdNo:
          editingTruck.driverId?.identification_No || '',
      });

      setDriverQuery(
        editingTruck.driverId?.name || '',
      );

      setIsNewDriver(false);
    } else {
      setItem({
        plate: '',
        model: '',
        capacity: '',
        driverId: '',
        driverPhone: '',
        driverIdNo: '',
      });

      setDriverQuery('');
      setIsNewDriver(false);
    }

    setShowDropdown(false);
  }, [visible, editingTruck]);

  // SAVE
  const handleSave = async () => {
    // VALIDATION
    if (!item.plate?.trim()) {
      setMsg({
        msg: 'Truck plate is required',
        state: 'error',
      });
      return;
    }

    if (!item.model?.trim()) {
      setMsg({
        msg: 'Truck model is required',
        state: 'error',
      });
      return;
    }

    if (!item.capacity) {
      setMsg({
        msg: 'Truck capacity is required',
        state: 'error',
      });
      return;
    }

    // NEW DRIVER VALIDATION
    if (!item.driverId) {
      if (!driverQuery?.trim()) {
        setMsg({
          msg: 'Driver name is required',
          state: 'error',
        });
        return;
      }

      if (!item.driverPhone?.trim()) {
        setMsg({
          msg: 'Driver phone is required',
          state: 'error',
        });
        return;
      }

      if (!item.driverIdNo?.trim()) {
        setMsg({
          msg: 'Driver ID number is required',
          state: 'error',
        });
        return;
      }
    }

    try {
      const payload: any = {
        plate: item.plate.trim().toUpperCase(),
        model: item.model.trim(),
        capacity: item.capacity,
      };

      // EXISTING DRIVER
      if (item.driverId) {
        payload.driverId = item.driverId;
      } else {
        // NEW DRIVER
        payload.driver = {
          name: driverQuery.trim(),
          phone_number: item.driverPhone.trim(),
          identification_No:
            item.driverIdNo.trim(),
        };
      }

      // UPDATE
      if (editingTruck) {
        await updateTruck({
          id: editingTruck._id,
          body: payload,
        }).unwrap();

        setMsg({
          msg: 'Truck updated successfully',
          state: 'success',
        });
      } else {
        // CREATE
        await createTruck(payload).unwrap();

        setMsg({
          msg: 'Truck created successfully',
          state: 'success',
        });
      }

      onClose();
    } catch (err: any) {
      setMsg({
        msg:
          err?.data?.message ||
          'Something went wrong',
        state: 'error',
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            backgroundColor: colors.background,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <SectionHeader
            title={
              editingTruck
                ? 'Edit Truck'
                : 'Add Truck'
            }
          />

          {/* PLATE */}
          <FormInput
            label="Plate"
            value={item.plate}
            onChangeText={text =>
              setItem({
                ...item,
                plate: text.toUpperCase(),
              })
            }
          />

          {/* MODEL */}
          <FormInput
            label="Model"
            value={item.model}
            onChangeText={text =>
              setItem({
                ...item,
                model: text,
              })
            }
          />

          {/* CAPACITY */}
          <FormInput
            label="Capacity"
            value={item.capacity}
            keyboardType="numeric"
            onChangeText={text =>
              setItem({
                ...item,
                capacity: text,
              })
            }
          />

          {/* DRIVER */}
          <Text
            style={{
              color: colors.text,
              fontWeight: '600',
              marginTop: 12,
              marginBottom: 6,
            }}
          >
            Assign Driver
          </Text>

          <FormInput
            label=""
            placeholder="Search driver..."
            value={driverQuery}
            onFocus={() => setShowDropdown(true)}
            onChangeText={text => {
              setDriverQuery(text);

              setShowDropdown(true);

              setItem((prev: any) => ({
                ...prev,
                driverId: '',
              }));

              setIsNewDriver(text.length > 0);
            }}
          />

          {/* DROPDOWN */}
          {showDropdown && (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                marginTop: 6,
                maxHeight: 180,
                backgroundColor: colors.card,
              }}
            >
              <FlatList
                data={filteredDrivers}
                keyExtractor={d => d._id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item: d }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setItem((prev: any) => ({
                        ...prev,
                        driverId: d._id,
                        driverPhone:
                          d.phone_number || '',
                        driverIdNo:
                          d.identification_No ||
                          '',
                      }));

                      setDriverQuery(d.name);

                      setIsNewDriver(false);

                      setShowDropdown(false);
                    }}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor:
                        colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {d.name}
                    </Text>

                    <Text
                      style={{
                        color: colors.secondary,
                        fontSize: 12,
                      }}
                    >
                      {d.phone_number}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* NEW DRIVER */}
          {isNewDriver && (
            <View style={{ marginTop: 12 }}>
              <PhoneInput
                label="Driver Phone"
                value={item.driverPhone || ''}
                country={country}
                onChangeCountry={setCountry}
                onChange={full =>
                  setItem((prev: any) => ({
                    ...prev,
                    driverPhone: full,
                  }))
                }
              />

              <FormInput
                label="Driver ID Number"
                value={item.driverIdNo || ''}
                onChangeText={text =>
                  setItem((prev: any) => ({
                    ...prev,
                    driverIdNo: text,
                  }))
                }
              />
            </View>
          )}

          {/* TOAST */}
          {msg.msg ? (
            <Toast
              setMsg={setMsg}
              msg={msg.msg}
              state={msg.state}
            />
          ) : null}

          {/* BUTTONS */}
          <PrimaryButton
            title={
              editingTruck
                ? 'Save Changes'
                : 'Add Truck'
            }
            onPress={handleSave}
            loading={
              editingTruck
                ? isUpdating
                : isLoading
            }
          />

          <SecondaryButton
            title="Cancel"
            onPress={onClose}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
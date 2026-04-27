/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useGetUsersQuery } from '../../services/apis/auth.api';
import { useTheme } from '../../contexts/themeContext';
import {
  useCreateTruckMutation,
  useEditTruckMutation,
} from '../../services/apis/trucks.api';
import { PrimaryButton } from '../PrimaryButton';
import { SecondaryButton } from '../SecondaryButton';
import Toast from '../toast';
import { FormInput } from '../input.component';

interface Staff {
  _id: string;
  name: string;
}

interface TruckFormModalProps {
  visible: boolean;
  onClose: () => void;

  editingTruck?: any;
  item: {
    plate: string;
    model: string;
    capacity: string;
    driverId: string;
  };
  setItem: React.Dispatch<
    React.SetStateAction<{
      plate: string;
      model: string;
      capacity: string;
      driverId: string;
    }>
  >;
}

export default function TruckFormModal({
  visible,
  onClose,
  editingTruck,
  item,
  setItem,
}: TruckFormModalProps) {
  const { colors } = useTheme();

  const [msg, setMsg] = useState({ msg: '', state: '' });

  const { data } = useGetUsersQuery({
    page: 1,
    role: 'driver',
  });
  const drivers = data?.users || [];
  const [postTruck, { isLoading }] = useCreateTruckMutation();
  const [updateTruckMutation, { isLoading: isUpdating }] =
    useEditTruckMutation();
  const handleSave = async () => {
    if (!item.plate || !item.model || !item.capacity || !item.driverId) {
      setMsg({ msg: 'Please fill all fields', state: 'error' });
    }

    try {
      if (editingTruck) {
        // TODO: call update API
        await updateTruckMutation({
          id: editingTruck._id,
          body: {
            plate: item.plate.trim().toUpperCase(),
            model: item.model.trim(),
            capacity: item.capacity.trim(),
            driverId: item.driverId,
          },
        }).unwrap();
        setMsg({ msg: 'Truck updated successfully', state: 'success' });
        onClose();
      } else {
        await postTruck({
          plate: item.plate.trim().toUpperCase(),
          model: item.model.trim(),
          capacity: item.capacity.trim(),
          driverId: item.driverId,
        }).unwrap();

        setMsg({ msg: 'Truck created successfully', state: 'success' });
        onClose();
      }
    } catch (error: any) {
      setMsg({ msg: error?.data?.message || 'Failed to create truck', state: 'error' });
      console.log(error);
    }
  };
  useEffect(() => {
    if (editingTruck && visible) {
      setItem({
        plate: editingTruck.plate || '',
        model: editingTruck.model || '',
        capacity: editingTruck.capacity || '',
        driverId: editingTruck.driverId || '',
      });
    } else if (visible) {
      setItem({
        plate: '',
        model: '',
        capacity: '',
        driverId: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTruck, visible]);
  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={{ flex: 1, backgroundColor: colors.background, padding: 24 }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
            marginBottom: 16,
          }}
        >
          {editingTruck ? 'Edit Truck' : 'Add Truck'}
        </Text>
        <FormInput
          label="Sender Name"
          value={item.plate}
          placeholder="Plate Number"
          onChangeText={text => setItem({ ...item, plate: text.toUpperCase() })}
        />
        <FormInput
          label="Model"
          value={item.model}
          placeholder="Model"
          onChangeText={text => setItem({ ...item, model: text })}
        />
        <FormInput
          label="Capacity"
          value={item.capacity}
          placeholder="Capacity"
          keyboardType="numeric"
          onChangeText={text => setItem({ ...item, capacity: text })}
        />

        {/* Driver Dropdown */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
          }}
        >
          Assign Driver
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <Picker
            selectedValue={item.driverId}
            onValueChange={text => setItem({ ...item, driverId: text })}
          >
            <Picker.Item label="Select Driver" value="" />
            {drivers.map((s: Staff) => (
              <Picker.Item key={s._id} label={s.name} value={s._id} />
            ))}
          </Picker>
        </View>
        {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
        <PrimaryButton
          title={editingTruck ? 'Save' : 'Add Truck'}
          onPress={handleSave}
          loading={editingTruck ? isUpdating : isLoading}
          disabled={
            !item.plate || !item.model || !item.capacity || !item.driverId
          }
        />

        <SecondaryButton title="Cancel" onPress={onClose} />
      </View>
    </Modal>
  );
}

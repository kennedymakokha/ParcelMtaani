/* eslint-disable react-native/no-inline-styles */

import {
  Modal,
  View,
} from 'react-native';

import { SectionHeader } from '../../components/ui/sectionHeader';
import { FormInput } from '../../components/input.component';
import { SecondaryButton } from '../../components/SecondaryButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../contexts/themeContext';

export const AddPickupModal = ({
  modalVisible,
  editingPickup,
  pickupName,
  setPickupName,
  phoneNumber,
  setPhoneNumber,
  shortCode,
  setShortCode,
  contactNumber,
  setContactNumber,
  savePickup,
  isLoading,
  setModalVisible,
}: any) => {
  const { colors } = useTheme();
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View
        style={{ flex: 1, padding: 20, backgroundColor: colors.background }}
      >
        <SectionHeader title={editingPickup ? 'Edit Pickup' : 'Add Pickup'} />
        <FormInput
          label="Pickup Name"
          placeholder="Pickup Name"
          value={pickupName}
          onChangeText={setPickupName}
        />
        <FormInput
          label="Phone Number"
          placeholder="712 345 678"
          keyboardType="phone-pad"
          withCountryCode
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <FormInput
          label="Short Code"
          placeholder="Short Code"
          value={shortCode}
          onChangeText={setShortCode}
        />
        <FormInput
          label="Contact Person's Number"
          placeholder="712 345 678"
          keyboardType="phone-pad"
          withCountryCode
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        <PrimaryButton
          title={editingPickup ? 'Update' : 'Create'}
          onPress={savePickup}
          loading={isLoading}
        />
        <SecondaryButton onPress={() => setModalVisible()} title="Cancel" />
      </View>
    </Modal>
  );
};

/* eslint-disable react-native/no-inline-styles */

import { Modal, View } from 'react-native';

import { SectionHeader } from '../../components/ui/sectionHeader';
import { FormInput } from '../../components/input.component';
import { SecondaryButton } from '../../components/SecondaryButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../contexts/themeContext';
import { PhoneInput } from '../../components/phoneinput';
import { useState } from 'react';
import { COUNTRIES } from '../../utils/countryCodes';

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
  contactName,
  setcontactName,
  setModalVisible,
}: any) => {
  const { colors } = useTheme();
  const [country, setCountry] = useState(COUNTRIES[0]); // default
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

        <PhoneInput
          label="Phone Number"
          placeholder="712 345 678"
          value={phoneNumber}
          country={country}
          onChangeCountry={setCountry}
          onChange={full => setPhoneNumber(full)}
        />
        <FormInput
          label="Short Code"
          placeholder="Short Code"
          value={shortCode}
          onChangeText={setShortCode}
        />
        <FormInput
          label="Contact Person"
          placeholder="James Maina"
          capitalize
          value={contactName}
          onChangeText={setcontactName}
        />
        <PhoneInput
          label="Contact Person's Number"
          value={contactNumber}
          country={country}
          onChangeCountry={setCountry}
          onChange={full => setContactNumber(full)}
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

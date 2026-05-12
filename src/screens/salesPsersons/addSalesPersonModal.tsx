/* eslint-disable react-native/no-inline-styles */

import {
  Modal,
  View,
} from 'react-native';

import { SectionHeader } from '../../components/ui/sectionHeader';
import { FormInput } from '../../components/input.component';
import { PhoneInput } from '../../components/phoneinput';

import { SecondaryButton } from '../../components/SecondaryButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../contexts/themeContext';

export const AddSalesPsersonModal = ({
  showModal,
  editingStaff,
  name,
  setName,
  country,
  setCountry,
  identification_No,
  setIdentification_No,
  phone,
  setPhone,
  isCreating,
  saveStaff,
  setShowModal
}: any) => {
  const { colors } = useTheme();
  return (
    <Modal visible={showModal} animationType="slide">
      <View
        style={{ flex: 1, padding: 24, backgroundColor: colors.background }}
      >
        <SectionHeader title={editingStaff ? 'Edit Staff' : 'Add Staff'} />

        <FormInput
          label="Name"
          placeholder="Name"
          capitalize
          value={name}
          onChangeText={setName}
        />

        <FormInput
          label="Identification Number"
          placeholder="ID No"
          value={identification_No}
          onChangeText={setIdentification_No}
        />

        <PhoneInput
          label="Phone Number"
          value={phone}
          country={country}
          onChangeCountry={setCountry}
          onChange={setPhone}
        />

        <PrimaryButton
          title={isCreating ? 'Saving...' : 'Save'}
          onPress={saveStaff}
        />

        <SecondaryButton title="Cancel" onPress={() => setShowModal(false)} />
      </View>
    </Modal>
  );
};

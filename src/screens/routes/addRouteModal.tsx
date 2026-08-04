/* eslint-disable react-native/no-inline-styles */

import { Modal, View } from 'react-native';

import { SectionHeader } from '../../components/ui/sectionHeader';
import { FormInput } from '../../components/input.component';
import { SecondaryButton } from '../../components/SecondaryButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../contexts/themeContext';


export const AddModal = ({
  modalVisible,
  editingRoute,
  RouteName,
  setRouteName,

  shortCode,
  setShortCode,

  saveRoute,
  isLoading,
  contactName,
  setcontactName,
  setModalVisible,
}: any) => {
  const { colors } = useTheme();
  return (
    <Modal visible={modalVisible} animationType="slide">
      <View
        style={{ flex: 1, padding: 20, backgroundColor: colors.background }}
      >
        <SectionHeader title={editingRoute ? 'Edit Route' : 'Add Route'} />
        <FormInput
          label="Route Name"
          placeholder="Route Name"
          value={RouteName}
          onChangeText={setRouteName}
        />

       
        <FormInput
          label="Short Code"
          placeholder="NRB-KTL"
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
      

        <PrimaryButton
          title={editingRoute ? 'Update' : 'Create'}
          onPress={saveRoute}
          loading={isLoading}
        />
        <SecondaryButton onPress={() => setModalVisible()} title="Cancel" />
      </View>
    </Modal>
  );
};

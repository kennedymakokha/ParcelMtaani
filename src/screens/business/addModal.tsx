/* eslint-disable react-native/no-inline-styles */

import {
  Modal,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { SectionHeader } from '../../components/ui/sectionHeader';
import { FormInput } from '../../components/input.component';
import { PhoneInput } from '../../components/phoneinput';
import Toast from '../../components/toast';
import { SecondaryButton } from '../../components/SecondaryButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useTheme } from '../../contexts/themeContext';




export const AddBusinessModal= ({
  showFormModal,
  editingId,
  form,
  setForm,
  country,
  setCountry,
  setMsg,
  msg,
  handleSave,
  savingbusiness,
  setShowFormModal
}:any) => {
  const { colors } = useTheme();
  return (
    <Modal visible={showFormModal} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.overlay,
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <SectionHeader
                title={editingId ? 'Edit Business' : 'Add Business'}
              />

              <FormInput
                label="Business Name"
                capitalize
                value={form.business_name}
                onChangeText={text => setForm({ ...form, business_name: text })}
              />
              <PhoneInput
                label="Phone Number"
                value={form.phone_number}
                onChange={(text: any) =>
                  setForm({ ...form, phone_number: text })
                }
                country={country}
                onChangeCountry={setCountry}
              />
              <FormInput
                label="Postal Address"
                value={form.postal_address}
                onChangeText={text =>
                  setForm({ ...form, postal_address: text })
                }
              />
              <PhoneInput
                label="Contact Number"
                value={form.contact_number}
                onChange={(text: any) =>
                  setForm({ ...form, contact_number: text })
                }
                country={country}
                onChangeCountry={setCountry}
              />
              <FormInput
                label="KRA PIN"
                value={form.kra_pin}
                onChangeText={text => setForm({ ...form, kra_pin: text })}
              />

              {msg.msg && (
                <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />
              )}

              <PrimaryButton
                title={editingId ? 'Update Business' : 'Add Business'}
                onPress={handleSave}
                loading={savingbusiness}
              />
              <SecondaryButton
                title="Cancel"
                onPress={() => setShowFormModal()}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};


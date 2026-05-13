/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native';
import { FormInput } from '../../components/input.component';
import { PhoneInput } from '../../components/phoneinput';
import { Text } from 'react-native';

export const ReceiverSection = ({
  formData,
  updateField,
  country,
  setCountry,
  colors
}: any) => {
  return (
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
        capitalize
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
  );
};

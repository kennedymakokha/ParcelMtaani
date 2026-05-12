/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native';
import { FormInput } from '../../components/input.component';
import { PhoneInput } from '../../components/phoneinput';
import { Text } from 'react-native';

export const SenderSection = ({
  formData,
  updateField,
  country,
  setCountry,
  colors,
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
        Sender Details
      </Text>

      <FormInput
        label="Sender Name"
        value={formData.sender.name}
        onChangeText={t => updateField('sender', 'name', t)}
      />

      <PhoneInput
        label="Sender Phone"
        value={formData.sender.phone}
        country={country}
        onChangeCountry={setCountry}
        onChange={t => updateField('sender', 'phone', t)}
      />
    </View>
  );
};

/* eslint-disable react-native/no-inline-styles */
import { View } from 'react-native';
import { FormInput } from '../../components/input.component';
import { Text } from 'react-native';
import { Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFetchPickupsQuery } from '../../services/apis/business.api';
import { useEffect } from 'react';

export const ParcelSection = ({
  formData,
  updateField,
  setFormData,
  colors,

  user,
  setPickup,
  pickup,
}: any) => {
  const { data, refetch } = useFetchPickupsQuery({});

  const pickups = data.pickups ?? [];
  useEffect(() => {
    const Refetch = async () => {
      await refetch();
    };

    Refetch();
  }, [refetch]);

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
          }}
        >
          Parcel Details
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text,
              marginRight: 8,
            }}
          >
            Fragile
          </Text>

          <Switch
            value={formData.parcel.fragile}
            onValueChange={value =>
              setFormData((prev: any) => ({
                ...prev,

                parcel: {
                  ...prev.parcel,
                  fragile: value,
                },
              }))
            }
          />
        </View>
      </View>

      <FormInput
        label="Weight (kg)"
        keyboardType="numeric"
        value={formData.parcel.weight}
        onChangeText={t => updateField('parcel', 'weight', t)}
      />

      <FormInput
        label="Special Instructions"
        multiline
        value={formData.parcel.instructions}
        onChangeText={t => updateField('parcel', 'instructions', t)}
      />
      <FormInput
        label="Charges"
        keyboardType="numeric"
        value={formData.parcel.price}
        onChangeText={t => updateField('parcel', 'price', t)}
      />
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
        }}
      >
        <Picker selectedValue={pickup} onValueChange={v => setPickup(v)}>
          <Picker.Item label="-- Select Destination --" value={null} />
          {pickups
            ?.filter((pickup: any) => pickup._id !== user.pickup?._id)
            .map((pickup: any) => (
              <Picker.Item
                key={pickup._id}
                label={pickup.pickup_name}
                value={pickup._id}
              />
            ))}
        </Picker>
      </View>
    </View>
  );
};

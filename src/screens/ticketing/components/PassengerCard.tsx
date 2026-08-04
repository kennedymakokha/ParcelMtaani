/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../../contexts/themeContext';


interface Props {
  passenger: {
    fullName: string;
    phone: string;
    nationalId: string;
    gender: string;
    emergencyContact?: string;
  };

  setPassenger: React.Dispatch<React.SetStateAction<any>>;
}

export default function PassengerCard({
  passenger,
  setPassenger,
}: Props) {
  const { colors } = useTheme();

  const update = (key: string, value: string) => {
    setPassenger((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}>

      {/* Header */}

      <View style={styles.header}>

        <Icon
          name="account-circle-outline"
          size={24}
          color={colors.primary}
        />

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}>
          Passenger Details
        </Text>

      </View>

      {/* Full Name */}

      <Text
        style={[
          styles.label,
          {
            color: colors.secondary,
          },
        ]}>
        Full Name
      </Text>

      <TextInput
        value={passenger.fullName}
        onChangeText={(v) => update('fullName', v)}
        placeholder="John Doe"
        placeholderTextColor={colors.secondary}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      {/* Phone */}

      <Text
        style={[
          styles.label,
          {
            color: colors.secondary,
          },
        ]}>
        Phone Number
      </Text>

      <View
        style={[
          styles.phoneRow,
          {
            borderColor: colors.border,
          },
        ]}>

        <Icon
          name="phone-outline"
          size={18}
          color={colors.primary}
        />

        <TextInput
          keyboardType="phone-pad"
          value={passenger.phone}
          onChangeText={(v) => update('phone', v)}
          placeholder="07XXXXXXXX"
          placeholderTextColor={colors.secondary}
          style={[
            styles.phoneInput,
            {
              color: colors.text,
            },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.lookupButton,
            {
              backgroundColor: colors.primary,
            },
          ]}>
          <Icon
            name="magnify"
            size={18}
            color="#FFF"
          />
        </TouchableOpacity>

      </View>

      {/* National ID */}

      <Text
        style={[
          styles.label,
          {
            color: colors.secondary,
          },
        ]}>
        National ID / Passport
      </Text>

      <TextInput
        value={passenger.nationalId}
        onChangeText={(v) => update('nationalId', v)}
        placeholder="Optional"
        placeholderTextColor={colors.secondary}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

      {/* Gender */}

      <Text
        style={[
          styles.label,
          {
            color: colors.secondary,
          },
        ]}>
        Gender
      </Text>

      <View
        style={[
          styles.pickerContainer,
          {
            borderColor: colors.border,
          },
        ]}>

        <Picker
          selectedValue={passenger.gender}
          onValueChange={(v) => update('gender', v)}>

          <Picker.Item
            label="Select Gender"
            value=""
          />

          <Picker.Item
            label="Male"
            value="Male"
          />

          <Picker.Item
            label="Female"
            value="Female"
          />

        </Picker>

      </View>

      {/* Emergency Contact */}

      <Text
        style={[
          styles.label,
          {
            color: colors.secondary,
          },
        ]}>
        Emergency Contact
      </Text>

      <TextInput
        value={passenger.emergencyContact}
        onChangeText={(v) => update('emergencyContact', v)}
        placeholder="Optional"
        placeholderTextColor={colors.secondary}
        keyboardType="phone-pad"
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '600',
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  phoneRow: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
  },

  lookupButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },

  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },

});
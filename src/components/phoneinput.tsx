/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { CountryPickerModal } from './modals/countryCodePicker';
import { COUNTRIES } from '../utils/countryCodes';

export interface Country {
  name: string;
  dialCode: string;
  flag: string;
  code: string;
}

interface PhoneInputProps {
  label: string;
  value?: string; // ✅ optional now (prevents crash)
  onChange: (full: string, raw: string) => void;

  country: Country;
  onChangeCountry: (country: Country) => void;

  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value = '', // ✅ default fallback
  onChange,
  country,
  onChangeCountry,
  placeholder = '712345678',
}) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);

  // 🔍 extract raw number safely
  const rawNumber = useMemo(() => {
    if (!value || !value.startsWith(country.dialCode)) return value || '';
    return value.replace(country.dialCode, '');
  }, [value, country]);

  // 🧹 normalize input
  const normalize = (input: string) => {
    let cleaned = input.replace(/\D/g, '');

    // remove leading 0
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1);
    }

    return cleaned;
  };

  // 📞 handle typing
  const handleChange = (text: string) => {
    const raw = normalize(text);
    const full = `${country.dialCode}${raw}`;

    onChange(full, raw);
  };

  // 🌍 handle country change auto-fix
  useEffect(() => {
    if (value && !value.startsWith(country.dialCode)) {
      const raw = normalize(value);
      onChange(`${country.dialCode}${raw}`, raw);
    }
  }, [country]);

  const isValid = rawNumber.length >= 9;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: isValid ? colors.border : 'red',
            backgroundColor: colors.card,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.countryCodeContainer}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={[styles.code, { color: colors.text }]}>
            {country.dialCode}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || '#999'}
          value={rawNumber || ''} // ✅ always safe
          onChangeText={handleChange}
        />
      </View>

      {!isValid && rawNumber.length > 0 && (
        <Text style={styles.error}>Invalid phone number</Text>
      )}

      <CountryPickerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        countries={COUNTRIES}
        onSelect={(c) => {
          onChangeCountry(c); // ✅ critical
          setShowModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  flag: {
    fontSize: 18,
    marginRight: 6,
  },
  code: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
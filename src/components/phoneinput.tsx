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
  value?: string;
  onChange: (full: string, raw: string) => void;
  country: Country;
  onChangeCountry: (country: Country) => void;
  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value = '',
  onChange,
  country,
  onChangeCountry,
  placeholder = '712345678',
}) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // ✅ Track focus state

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
  // ✅ Only trigger the visual error validation if there's text AND the user isn't typing
  const showValidationError = !isValid && rawNumber.length > 0 && !isFocused;

  // ✅ Clean theme border color resolver
  const getBorderColor = () => {
    if (showValidationError) return colors.error || 'red';
    if (isFocused) return colors.secondary || '#f97316'; // Dynamic brand highlight
    return colors.border || '#ccc';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(), // ✅ Controlled dynamically now
            backgroundColor: colors.card,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.countryCodeContainer, { borderColor: colors.border || '#ccc' }]}
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
          value={rawNumber || ''}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)} // ✅ Set focus
          onBlur={() => setIsFocused(false)}  // ✅ Clear focus to trigger verification safely
        />
      </View>

      {showValidationError && (
        <Text style={[styles.error, { color: colors.error || 'red' }]}>
          Invalid phone number
        </Text>
      )}

      <CountryPickerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        countries={COUNTRIES}
        onSelect={(c) => {
          onChangeCountry(c);
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
    borderWidth: 1.2, // Slightly tuned up thickness for visibility parity
    borderRadius: 8,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
    height: '100%', // Match text box height axis perfectly
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
    fontSize: 12,
    marginTop: 4,
  },
});
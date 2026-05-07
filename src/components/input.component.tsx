/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { COUNTRIES } from '../utils/countryCodes';
import { CountryPickerModal } from './modals/countryCodePicker';

interface Country {
  name: string;
  dialCode: string;
  flag: string;
}

interface FormInputProps {
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  value?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: any;
  containerStyle?: StyleProp<ViewStyle>;

  // country props
  withCountryCode?: boolean;
  selectedCountry?: Country;
  onSelectCountry?: (country: Country) => void | any;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  value,
  onChangeText,
  containerStyle,
  onFocus,
  withCountryCode = false,
  selectedCountry,
  onSelectCountry,
}) => {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);

  // ✅ state for password visibility
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  // ✅ sync if prop changes
  useEffect(() => {
    setIsSecure(secureTextEntry);
  }, [secureTextEntry]);

  const isPhoneInput = keyboardType === 'phone-pad' && withCountryCode;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        {/* Country Code */}
        {isPhoneInput && selectedCountry && (
          <TouchableOpacity
            style={styles.countryCodeContainer}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={[styles.code, { color: colors.text }]}>
              {selectedCountry.dialCode}
            </Text>
          </TouchableOpacity>
        )}

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              minHeight: multiline ? 80 : 48,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || '#999'}
          keyboardType={keyboardType}
          multiline={multiline}
          secureTextEntry={isSecure}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          autoCapitalize="none"
        />

        {/* ✅ Show / Hide toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(prev => !prev)}
            style={styles.toggleBtn}
          >
            <Text style={{ color: colors.text, fontSize: 12 }}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Country Picker Modal */}
      {isPhoneInput && (
        <CountryPickerModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          countries={COUNTRIES}
          onSelect={country => {
            onSelectCountry?.(country);
            setShowModal(false);
          }}
        />
      )}
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
  toggleBtn: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../contexts/themeContext';
import { Business, useBusiness } from '../../contexts/BusinessContext';
import { useUpdateBusinessMutation } from '../../services/apis/business.api';

const ProfileField = ({
  label,
  value,
  icon,
  editable,
  secure,
  onChange,
  showKey,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  editable: boolean;
  secure?: boolean;
  onChange?: (t: string) => void;
  showKey?: boolean;
  colors: any;
}) => (
  <View
    style={[
      styles.fieldCard,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
    ]}
  >
    <View style={styles.fieldHeader}>
      <Ionicons name={icon} size={16} color={colors.primary} />

      <Text style={[styles.fieldLabel, { color: colors.subText }]}>
        {label}
      </Text>
    </View>

    {editable ? (
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: '#0F172A',
          },
        ]}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure && !showKey}
        placeholder={`Enter ${label}`}
        placeholderTextColor={colors.subText}
      />
    ) : (
      <Text
        style={[styles.valueText, { color: colors.text }]}
        numberOfLines={1}
      >
        {secure && !showKey ? '••••••••••••' : value || '---'}
      </Text>
    )}
  </View>
);

export const BusinessProfileScreen = () => {
  const { colors } = useTheme();

  const { business, updateBusiness, isLoading } = useBusiness();

  const [updateBusinessRemotely, { isLoading: isUpdating }] =
    useUpdateBusinessMutation();

  const [isEditing, setIsEditing] = useState(false);

  const [showKey, setShowKey] = useState(false);

  const [data, setData] = useState<Business>({
    _id: '',
    business_name: '',
    postal_address: '',
    phone_number: '',
    contact_number: '',
    kra_pin: '',
    printQr: false,
    working_hrs: '8-17',
    api_key: '',
    latitude: 0,
    longitude: 0,
    primary_color: '',
    secondary_color: '',
    logo: '',
    state: 'inactive',
    strictMpesa: false,
  });

  useEffect(() => {
    if (business) {
      setData({
        ...business,
        printQr: business.printQr ?? false,
        strictMpesa: business.strictMpesa ?? false,
      });
    }
  }, [business]);

  const handleChange = (key: keyof Business, value: any) => {
    setData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updated = await updateBusinessRemotely(data).unwrap();

      // update context immediately
      updateBusiness(updated);

      setIsEditing(false);
    } catch (err) {
      console.error('Business update failed:', err);
    }
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        style={{ flex: 1 }}
        size="large"
        color={colors.primary}
      />
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* BUSINESS IDENTITY */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Business Identity
          </Text>
          <View style={styles.row}>
            <ProfileField
              label="Business Name"
              value={data.business_name}
              icon="business"
              editable={isEditing}
              onChange={t => handleChange('business_name', t)}
              colors={colors}
            />
          </View>
          <View style={styles.row}>
            <ProfileField
              label="Phone"
              value={data.phone_number}
              icon="call"
              editable={isEditing}
              onChange={t => handleChange('phone_number', t)}
              colors={colors}
            />

            <ProfileField
              label="Contact Person"
              value={data.contact_number}
              icon="person"
              editable={isEditing}
              onChange={t => handleChange('contact_number', t)}
              colors={colors}
            />
          </View>

          <View style={styles.row}>
            <ProfileField
              label="KRA PIN"
              value={data.kra_pin}
              icon="document-text"
              editable={isEditing}
              onChange={t => handleChange('kra_pin', t)}
              colors={colors}
            />

            <ProfileField
              label="Postal Address"
              value={data.postal_address}
              icon="mail"
              editable={isEditing}
              onChange={t => handleChange('postal_address', t)}
              colors={colors}
            />
          </View>

          {/* SYSTEM CONFIG */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.primary,
                marginTop: 24,
              },
            ]}
          >
            System Configuration
          </Text>

          <TouchableOpacity
            onPress={() => setShowKey(!showKey)}
            activeOpacity={0.8}
            style={styles.row}
          >
            <ProfileField
              label="API Access Key"
              value={data.api_key}
              icon="key"
              editable={isEditing}
              secure
              showKey={showKey}
              onChange={t => handleChange('api_key', t)}
              colors={colors}
            />
          </TouchableOpacity>

          {/* OPERATION HOURS */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.primary,
                marginTop: 24,
              },
            ]}
          >
            Operational Hours
          </Text>

          {['8-17', '9-18', '00-24'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.hourOption}
              disabled={!isEditing}
              onPress={() => handleChange('working_hrs', opt)}
            >
              <Ionicons
                name={
                  data.working_hrs === opt
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color={
                  data.working_hrs === opt ? colors.primary : colors.subText
                }
              />

              <Text style={[styles.hourLabel, { color: colors.text }]}>
                {opt === '8-17'
                  ? '8 AM - 5 PM'
                  : opt === '9-18'
                  ? '9 AM - 6 PM'
                  : '24 Hours'}
              </Text>
            </TouchableOpacity>
          ))}

          {/* FEATURES */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.primary,
                marginTop: 24,
              },
            ]}
          >
            Feature Access
          </Text>

          <View style={styles.row}>
            <TouchableOpacity
              disabled={!isEditing}
              style={[
                styles.toggleBtn,
                {
                  borderColor: data.strictMpesa
                    ? colors.primary
                    : colors.border,
                },
              ]}
              // onPress={() => handleChange('strictMpesa', !data.strictMpesa)}
            >
              <Ionicons
                name="card"
                size={18}
                color={data.strictMpesa ? colors.primary : colors.subText}
              />

              <Text style={[styles.toggleText, { color: colors.text }]}>
                Strict Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!isEditing}
              style={[
                styles.toggleBtn,
                {
                  borderColor: data.strictMpesa
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() => handleChange('strictMpesa', !data.strictMpesa)}
            >
              <Ionicons
                name="card"
                size={18}
                color={data.strictMpesa ? colors.primary : colors.subText}
              />

              <Text style={[styles.toggleText, { color: colors.text }]}>
                Strict Mpesa
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => {
              console.log('Locate business on map');
            }}
          >
            <Ionicons
              name="navigate-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={[styles.btnText, { color: colors.primary }]}>
              Locate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.btnText, { color: '#fff' }]}>
                {isEditing ? 'Save Configuration' : 'Edit Details'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },

  fieldCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 65,
    justifyContent: 'center',
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  valueText: {
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    padding: 4,
    fontSize: 14,
    fontWeight: '600',
    borderRadius: 4,
  },

  hourOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },

  hourLabel: {
    fontWeight: '600',
    fontSize: 14,
  },

  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },

  toggleText: {
    fontWeight: '700',
    fontSize: 13,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
  },

  actionBtn: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  btnText: {
    fontWeight: '700',
    fontSize: 15,
  },
});

export default BusinessProfileScreen;

// src/screens/Business/PickupManagementScreen.tsx
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
import { useSelector, useDispatch } from 'react-redux'; // 💡 FIX: Added missing useDispatch import
import {
  useUpdatePickupMutation,
  Pickup,
} from '../../services/apis/pickup.api';
import { setCurrentPickup } from '../../features/pickSlice';

// Reusable sub-component tailored for configurations
const ConfigurationField = ({
  label,
  value,
  icon,
  editable,
  secure,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  icon: string;
  editable: boolean;
  secure?: boolean;
  onChange?: (t: string) => void;
  colors: any;
}) => (
  <View
    style={[
      styles.fieldCard,
      { backgroundColor: colors.card, borderColor: colors.border },
    ]}
  >
    <View style={styles.fieldHeader}>
      <Ionicons name={icon} size={15} color={colors.primary} />
      <Text style={[styles.fieldLabel, { color: colors.subText }]}>
        {label}
      </Text>
    </View>
    {editable ? (
      <TextInput
        style={[
          styles.input,
          { color: colors.text, backgroundColor: '#0F172A' },
        ]}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        placeholder={`Set ${label}`}
        placeholderTextColor={colors.subText}
      />
    ) : (
      <Text
        style={[styles.valueText, { color: colors.text }]}
        numberOfLines={1}
      >
        {secure ? '••••••••••••••••' : value || '---'}
      </Text>
    )}
  </View>
);

const PickupManagementScreen = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();

  const pickup = useSelector((state: any) => state.pickups.currentPickup);
  const [updatePickupRemotely, { isLoading: isUpdating }] =
    useUpdatePickupMutation();
  const [isEditing, setIsEditing] = useState(false);

  // Sync state data when selecting or updating a station profile
  const [formData, setFormData] = useState<Partial<Pickup>>({});

  // Seed local form state with Redux store values
  useEffect(() => {
    if (pickup) {
      setFormData({
        ...pickup, // Spread all fields to retain base uneditable configuration criteria
        pickup_name: pickup.pickup_name || '',
        phone_number: pickup.phone_number || '',
        contactName: pickup.contactName || '',
        shortCode: pickup.shortCode || '',
        short_code: pickup.short_code || '',
        consumerKey: pickup.consumerKey || '',
        passKey: pickup.passKey || '',
        working_hrs: pickup.working_hrs || '8-17',
        strictMpesa: pickup.strictMpesa ?? false,
      });
    }
  }, [pickup]);

  const handleFieldChange = (key: keyof Pickup, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const saveConfiguration = async () => {
    if (!formData._id) return;
    try {
      // 1. Submit remote write transaction
      const updatedData: Pickup | any = await updatePickupRemotely({
        _id: formData._id,
        ...formData,
      }).unwrap();

      // 2. 💡 Sync state cleanly with the complete dataset returned from your database API
      dispatch(setCurrentPickup(updatedData));
      setIsEditing(false);
    } catch (err) {
      console.error('Pickup station updating failed:', err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* STATION DATA IDENTITY */}
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            Station Info
          </Text>
          <View style={styles.row}>
            <ConfigurationField
              label="Station Name"
              value={formData.pickup_name || ''}
              icon="storefront"
              editable={isEditing}
              onChange={t => handleFieldChange('pickup_name', t)}
              colors={colors}
            />
          </View>

          <View style={styles.row}>
            <ConfigurationField
              label="Station Phone"
              value={formData.phone_number || ''}
              icon="call"
              editable={isEditing}
              onChange={t => handleFieldChange('phone_number', t)}
              colors={colors}
            />
            <ConfigurationField
              label="Contact Manager"
              value={formData.contactName || ''}
              icon="person-circle"
              editable={isEditing}
              onChange={t => handleFieldChange('contactName', t)}
              colors={colors}
            />
          </View>

          {/* INTEGRATED LIPANAMPESA SYSTEM SETTINGS */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 20 },
            ]}
          >
            Daraja / M-Pesa Gateways
          </Text>

          <View style={styles.row}>
            <ConfigurationField
              label="Business ShortCode"
              value={formData.shortCode || ''}
              icon="barcode"
              secure
              editable={false}
              onChange={t => handleFieldChange('shortCode', t)}
              colors={colors}
            />
            <ConfigurationField
              label="Store Internal Code"
              value={formData.short_code || ''}
              icon="git-commit"
              editable={isEditing}
              onChange={t => handleFieldChange('short_code', t)}
              colors={colors}
            />
          </View>

          <View style={styles.row}>
            <ConfigurationField
              label="Consumer Key"
              value={formData.consumerKey || ''}
              icon="key"
              secure
              editable={false}
              onChange={t => handleFieldChange('consumerKey', t)}
              colors={colors}
            />
          </View>

          <View style={styles.row}>
            <ConfigurationField
              label="Pass Key"
              value={formData.passKey || ''}
              icon="lock-closed"
              secure
              editable={false}
              onChange={t => handleFieldChange('passKey', t)}
              colors={colors}
            />
          </View>

          {/* SERVICE OPERATION TIME */}
          {/* 💡 FIX: Removed duplicate header block from here */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 20 },
            ]}
          >
            Operating Shift Setup
          </Text>
          {['8-17', '9-18', '00-24'].map(opt => {
            const currentSelection = formData.working_hrs || '8-17';
            const isSelected = currentSelection.trim() === opt;

            return (
              <TouchableOpacity
                key={opt}
                style={styles.hourOption}
                disabled={!isEditing}
                onPress={() => handleFieldChange('working_hrs', opt)}
              >
                <Ionicons
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? colors.primary : colors.subText}
                />
                <Text style={[styles.hourLabel, { color: colors.text }]}>
                  {opt === '8-17'
                    ? '08:00 AM - 05:00 PM'
                    : opt === '9-18'
                    ? '09:00 AM - 06:00 PM'
                    : '24 Hours Continuous'}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* RESTRICTION CONFIGURATIONS */}
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.primary, marginTop: 20 },
            ]}
          >
            Payment Enforcement
          </Text>
          <View style={styles.row}>
            <TouchableOpacity
              disabled={!isEditing}
              style={[
                styles.toggleBtn,
                {
                  borderColor: formData.strictMpesa
                    ? colors.primary
                    : colors.border,
                },
              ]}
              onPress={() =>
                handleFieldChange('strictMpesa', !formData.strictMpesa)
              }
            >
              <Ionicons
                name="wallet"
                size={18}
                color={formData.strictMpesa ? colors.primary : colors.subText}
              />
              <Text style={[styles.toggleText, { color: colors.text }]}>
                Strict Paybill Validation
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION INTERFACES */}
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isEditing ? colors.primary : '#334155' },
            ]}
            onPress={isEditing ? saveConfiguration : () => setIsEditing(true)}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                {isEditing ? 'Save Settings Profile' : 'Edit Station Options'}
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
    paddingBottom: 130,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 10,
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
    borderRadius: 6,
  },
  hourOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  hourLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
    borderTopWidth: 1,
  },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default PickupManagementScreen;

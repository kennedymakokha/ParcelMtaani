/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TextInput, Switch, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import {
  useFetchDashboardStatsQuery,
} from '../services/apis/parcel.api';
import { displayDate } from '../utils/dates.utils';
import { useOpenPickupMutation } from '../services/apis/business.api';
import { SectionHeader } from '../components/ui/sectionHeader';
import { setCurrentPickup } from '../features/pickSlice';

export default function AdminDailyPaymentScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [useStkPush, setUseStkPush] = useState(true);
  const [phone, setPhone] = useState('');
  const [restorePickup, { isLoading }] = useOpenPickupMutation();
  const dispatch = useDispatch();
  const pickup = useSelector((state: any) => state.pickups.currentPickup);
  
  const {
    data,
    isLoading: loadingStats,
  } = useFetchDashboardStatsQuery({
    pickupId: pickup?._id,
    filterType: 'today',
    startDate: '',
    endDate: '',
  });
  
  const KPIdata = data ? data : {};
  // Gracefully fallback to 0 if data isn't compiled or fetched yet
  const amount = (KPIdata.pickupStats?.totalParcels || 0) * 5; 

  const handlePayment = async () => {
    try {
      if (useStkPush) {
        console.log(new Date(displayDate), displayDate);
        // TODO: call backend STK push API
      } else {
        console.log('Show Lipa na M-Pesa till procedure for amount', amount);
      }
      let v = await restorePickup({ pickup: pickup?._id });
      dispatch(setCurrentPickup(v.data.data || null));
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <SectionHeader title=" Daily Usage Payment" />

      {/* 💡 TAILWIND-STYLE LOADING SKELETON LAYER */}
      {loadingStats ? (
        <View style={{ flex: 1 }}>
          {/* Skeleton Card (Matches Tailwind's bg-white dark:bg-gray-800 animate-pulse) */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 24,
              borderRadius: 12,
              marginBottom: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              opacity: 0.7, // Simulates the pulsed layout look
            }}
          >
            <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.subText, fontSize: 14, fontWeight: '500' }}>
              Calculating today's parcel tallies...
            </Text>
          </View>

          {/* Dummy Switch skeleton row */}
          <View style={{ height: 40, backgroundColor: colors.card, borderRadius: 8, marginBottom: 20, opacity: 0.4 }} />
          {/* Dummy Input skeleton box */}
          <View style={{ height: 50, backgroundColor: colors.card, borderRadius: 8, marginBottom: 20, opacity: 0.4 }} />
        </View>
      ) : (
        /* NORMAL ACTIONABLE UI CONTENT AREA */
        <View style={{ flex: 1 }}>
          {/* Amount Card */}
          <View
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 8,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              Amount Due Today
            </Text>
            <Text
              style={{ fontSize: 24, fontWeight: '700', color: colors.success, marginTop: 4 }}
            >
              KES {amount}
            </Text>
          </View>

          {/* Switch between STK Push and Standard */}
          <View
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ color: colors.text, marginRight: 8, fontWeight: '500' }}>
              M-Pesa Standard
            </Text>
            <Switch
              value={useStkPush}
              onValueChange={setUseStkPush}
              trackColor={{ false: colors.secondary, true: colors.primaryLight }}
              thumbColor={useStkPush ? colors.primary : colors.card}
            />
            <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
              STK Push
            </Text>
          </View>

          {/* Conditional UI Input Shells */}
          {useStkPush ? (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.text, marginBottom: 8, fontWeight: '500' }}>
                Enter Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="07XX XXX XXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
            </View>
          ) : (
            <View style={{ marginBottom: 20, backgroundColor: colors.card, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, marginBottom: 12, fontWeight: '600', fontSize: 15 }}>
                Lipa na M-Pesa Till Procedure
              </Text>
              <Text style={{ color: colors.subText, lineHeight: 22 }}>
                1. Go to M-Pesa menu on your phone{'\n'}
                2. Select <Text style={{ fontWeight: '600', color: colors.text }}>Lipa na M-Pesa</Text> → Buy Goods and Services{'\n'}
                3. Enter Till Number: <Text style={{ fontWeight: '700', color: colors.primary }}>123456</Text>{'\n'}
                4. Enter Amount: <Text style={{ fontWeight: '700', color: colors.success }}>KES {amount}</Text>
                {'\n'}
                5. Enter your PIN and confirm
              </Text>
            </View>
          )}

          <View style={{ marginTop: 'auto', marginBottom: 16 }}>
            <PrimaryButton
              loading={isLoading}
              title="Pay Now"
              onPress={handlePayment}
            />
          </View>
        </View>
      )}
    </View>
  );
}
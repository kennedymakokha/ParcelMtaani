/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TextInput, Switch } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { useSelector } from 'react-redux';
import { useFetchParcelCountQuery } from '../services/apis/parcel.api';
import { displayDate } from '../utils/dates.utils';
import { useOpenPickupMutation } from '../services/apis/business.api';
import { SectionHeader } from '../components/ui/sectionHeader';

export default function AdminDailyPaymentScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [useStkPush, setUseStkPush] = useState(true);
  const [phone, setPhone] = useState('');
  const [restorePickup, { isLoading }] = useOpenPickupMutation();
  const {
    user: { pickup },
  } = useSelector((state: any) => state.auth);
  console.log(displayDate.toISOString());
  const { data } = useFetchParcelCountQuery({
    pickupId: pickup._id,
    displayDate: displayDate.toISOString(),
  });
  console.log(data);
  // Pre-entered daily usage amount
  const amount = 5000; // Example KES

  const handlePayment = async () => {
    try {
      if (useStkPush) {
        // console.log('Initiating STK Push for', phone, 'amount', amount);
        // await refetch();
        console.log(new Date(displayDate), displayDate);

        // TODO: call backend STK push API
      } else {
        console.log('Show Lipa na M-Pesa till procedure for amount', amount);
        // TODO: show instructions or call backend standard payment API
      }
      await restorePickup({ pickup: pickup?._id });
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <SectionHeader title=" Daily Usage Payment" />

      {/* Amount Card */}
      <View
        style={{
          backgroundColor: colors.card,
          padding: 16,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
          Amount Due Today
        </Text>
        <Text
          style={{ fontSize: 24, fontWeight: '700', color: colors.success }}
        >
          KES {amount}
        </Text>
      </View>

      {/* Switch between STK Push and Standard */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
      >
        <Text style={{ color: colors.text, marginRight: 8 }}>
          M-Pesa Standard
        </Text>
        <Switch
          value={useStkPush}
          onValueChange={setUseStkPush}
          trackColor={{ false: colors.secondary, true: colors.primaryLight }}
          thumbColor={useStkPush ? colors.primary : colors.card}
        />
        <Text style={{ color: colors.text, marginLeft: 8 }}>STK Push</Text>
      </View>

      {/* Conditional UI */}
      {useStkPush ? (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>
            Enter Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="07XX XXX XXX"
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
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text, marginBottom: 8 }}>
            Lipa na M-Pesa Till Procedure
          </Text>
          <Text style={{ color: colors.secondary }}>
            1. Go to M-Pesa menu on your phone{'\n'}
            2. Select Lipa na M-Pesa → Buy Goods and Services{'\n'}
            3. Enter Till Number: 123456{'\n'}
            4. Enter Amount: KES {amount}
            {'\n'}
            5. Enter your PIN and confirm
          </Text>
        </View>
      )}

      <PrimaryButton
        loading={isLoading}
        title="Pay Now"
        onPress={handlePayment}
      />
    </View>
  );
}

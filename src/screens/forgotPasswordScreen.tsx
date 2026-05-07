/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import { FormInput } from '../components/input.component';
import { PrimaryButton } from '../components/PrimaryButton';
import Toast from '../components/toast';
import { PhoneInput } from '../components/phoneinput';
import { COUNTRIES } from '../utils/countryCodes';
import { SectionHeader } from '../components/ui/sectionHeader';
import {
  useRequestOTPMutation,
  useResetPasswordMutation,
} from '../services/apis/auth.api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [item, setItem] = useState({
    phone_number: '',
    password: '',
    confirm_password: '',
    code: '',
  });
  const [requestOtp, { isLoading, isSuccess }] = useRequestOTPMutation();
  const [resetPassword, { isLoading: reseting }] = useResetPasswordMutation();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const [country, setCountry] = useState(COUNTRIES[0]);
  const handleReQuest = async () => {
    try {
      if (!item.phone_number) {
        setMsg({ msg: 'Phone number is required', state: 'error' });
        return;
      }
      await requestOtp({ phone_number: item.phone_number }).unwrap();
      // TODO: call backend API for password reset
      setMsg({
        msg: 'Password reset link sent to your pHone  Number',
        state: 'success',
      });
    } catch (error: any) {
      setMsg({
        msg: error.data.message,
        state: 'error',
      });
    }
  };

  const handleReset = async () => {
    try {
      if (!item.phone_number) {
        setMsg({ msg: 'Phone number is required', state: 'error' });
        return;
      }
      if (!item.code) {
        setMsg({ msg: 'Code is required', state: 'error' });
        return;
      }
      if (!item.password) {
        setMsg({ msg: 'Code is required', state: 'error' });
        return;
      }
      if (item.password !== item.confirm_password) {
        setMsg({ msg: 'password Mismatch', state: 'error' });
        return;
      }
      await resetPassword(item).unwrap();

      // TODO: call backend API for password reset
      setMsg({
        msg: 'Password reset Successful',
        state: 'success',
      });
      navigation.replace('Login');
    } catch (error: any) {
      console.log(error.data.message);
      setMsg({
        msg: error.data.message,
        state: 'error',
      });
    }
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        justifyContent: 'center',
      }}
    >
      <SectionHeader title="  Forgot Password" />

      <PhoneInput
        label="Phone Number"
        value={item.phone_number}
        country={country}
        onChangeCountry={setCountry}
        onChange={e => setItem(prev => ({ ...prev, phone_number: e }))}
      />

      {isSuccess && (
        <View>
          <FormInput
            label="Reset Code"
            value={item.code}
            keyboardType="numeric"
            onChangeText={e => setItem(prev => ({ ...prev, code: e }))}
            placeholder="Enter the code "
          />
          <FormInput
            label="Password"
            value={item.password}
            secureTextEntry
            onChangeText={e => setItem(prev => ({ ...prev, password: e }))}
            placeholder="Enter password"
          />
          <FormInput
            label=""
            value={item.confirm_password}
            secureTextEntry
            onChangeText={e =>
              setItem(prev => ({ ...prev, confirm_password: e }))
            }
            placeholder="Enter confirm password"
          />
        </View>
      )}
      {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}

      <PrimaryButton
        title={isSuccess ? 'Reset Password' : 'Send Reset code'}
        loading={isSuccess ? reseting : isLoading}
        onPress={isSuccess ? handleReset : handleReQuest}
      />
      <PrimaryButton
        title="Back to Login"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}

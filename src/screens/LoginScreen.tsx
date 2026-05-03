/* eslint-disable no-unreachable */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { TertiaryButton } from '../components/TertiaryButton';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../services/apis/auth.api';
import { setCredentials } from '../features/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentPickup } from '../features/pickSlice';
import Toast from '../components/toast';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { subscribeToTopics } from '../utils/topicSubsriptiptions';
import { FormInput } from '../components/input.component';
import { useTheme } from '../contexts/themeContext';
import { COUNTRIES } from '../utils/countryCodes';
import { PhoneInput } from '../components/phoneinput';

export default function LoginScreen({ navigation }: any) {
  const [phone_number, setPhoneNumber] = useState('+254790226514');
  const [password, setPassword] = useState('+254790226514');
  const [FCM_token, setFCM_token] = useState('');
  const { setUser } = useAuth();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const dispatch = useDispatch();
  const [loginUser, {  isLoading: loading }] = useLoginMutation();
  const { colors } = useTheme();
  const [country, setCountry] = useState(COUNTRIES[0]); // default
  const handleLogin = async () => {
    try {
      setMsg({ msg: '', state: '' });
 
      if (!phone_number || !password) {
        setMsg({ msg: 'Both fields are required', state: 'error' });
        return;
      }

      const data = await loginUser({
        phone_number,
        password,
        FCM_token,
      }).unwrap();

      if (data.ok) {
        dispatch(setCredentials({ ...data }));
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        dispatch(setCurrentPickup(data.user.pickup || null));

        if (data.exp) {
          await AsyncStorage.setItem('tokenExpiry', data.exp.toString());
          await subscribeToTopics(data);
          setUser(data.user);
        }
        setMsg({ msg: 'Login successful! Redirecting...', state: 'success' });
      } else {
        setMsg({ msg: 'Login failed, please try again', state: 'error' });
      }
    } catch (err: any) {
      console.log(err);
      setMsg({
        msg:
          err.message ||
          err.data?.message ||
          'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  useEffect(() => {
    async function getFcmToken() {
      const messagingInstance = getMessaging();
      const token = await getToken(messagingInstance);
      setFCM_token(token);
    }
    getFcmToken();
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const expiry = await AsyncStorage.getItem('tokenExpiry');
        if (token && expiry && Date.now() > Number(expiry) * 1000) {
          await AsyncStorage.clear();
        }
      } catch (err) {
        console.log('Auth check failed:', err);
      }
    };
    checkLogin();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      {/* Branding */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="truck-fast" size={74} color={colors.primary} />
      </View>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text
          style={{ fontSize: 28, fontWeight: '700', color: colors.primary }}
        >
          ParcelMtaani
        </Text>
        <Text style={{ color: colors.secondary, marginTop: 6 }}>
          Secure Login
        </Text>
      </View>

      {/* Form Card */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Welcome Back
        </Text>
        <PhoneInput
          label="Phone Number"
          value={phone_number}
          country={country}
          onChangeCountry={setCountry}
          onChange={full => setPhoneNumber(full)}
        />
       
        <FormInput
          label="Password"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

      

        <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />

        <View style={{ marginTop: 16 }}>
          <TertiaryButton
            title="Forgot Password?"
            onPress={() => navigation.goBack()}
            color={colors.primary}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={{ color: colors.text }}>
          Don’t have an account?{' '}
          <Text style={{ color: colors.primary, fontWeight: '600' }}>
            Sign Up
          </Text>
        </Text>
      </View>
        {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
    </View>
  );
}

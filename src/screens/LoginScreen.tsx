import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { AuthInput } from '../components/AuthInput'; // reusable input
import { PrimaryButton } from '../components/PrimaryButton'; // reusable button
import { SecondaryButton } from '../components/SecondaryButton';
import { TertiaryButton } from '../components/TertiaryButton';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../services/apis/auth.api';
import { setCredentials } from '../features/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setCurrentPickup } from '../features/pickSlice';
import Toast from '../components/toast';
export default function LoginScreen({ navigation }: any) {
  const [phone_number, setPhoneNumber] = useState('+254790226514');
  const [password, setPassword] = useState('+254790226514');

  const { setUser } = useAuth();
  const [msg, setMsg] = useState({ msg: '', state: '' });
  const dispatch = useDispatch();
  const [loginUser, { error, isLoading: loading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      setMsg({ msg: '', state: '' });

      if (!phone_number || !password) {
        setMsg({ msg: 'Both fields are required', state: 'error' });
        return;
      }

      const data = await loginUser({ phone_number, password }).unwrap();

      if (data.ok) {
        // Update Redux / AsyncStorage if needed
        dispatch(setCredentials({ ...data }));
        await AsyncStorage.setItem('accessToken', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        dispatch(setCurrentPickup(data.user.pickup._id || null));
     
        // if (data.exp) {
        //   await AsyncStorage.setItem('tokenExpiry', data.exp.toString());
        //   setUser(data.user);
        // }
        setMsg({ msg: 'Login successful! Redirecting...', state: 'success' });
      } else {
        setMsg({ msg: 'Login successful! Redirecting...', state: 'error' });
      }
    } catch (err: any) {
      setMsg({
        msg:
          err.message ||
          err.data ||
          err.data.message ||
          error ||
          'Error occurred, try again ',
        state: 'error',
      });
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const userId = await AsyncStorage.getItem('userId');
        const expiry = await AsyncStorage.getItem('tokenExpiry');

        if (token && userId) {
          if (expiry && Date.now() > Number(expiry) * 1000) {
            await AsyncStorage.clear();
            return;
          }
        }
      } catch (err) {
        console.log('Auth check failed:', err);
      }
    };

    checkLogin();
  }, []);
  return (
    <View className="flex-1 bg-gray-50 justify-center px-6">
      {/* Branding */}
      <View className="flex items-center justify-center">
        <Icon name="truck-fast" size={74} color="#3b82f6" />
      </View>
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-blue-700">ParcelMtaani</Text>
        <Text className="text-gray-500 mt-2">Secure Login</Text>
      </View>

      {/* Form Card */}
      <View className="bg-white rounded-xl shadow-md p-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Welcome Back
        </Text>

        <AuthInput
          label="Phone Number"
          placeholder="Enter your phone"
          value={phone_number}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {msg.msg && <Toast setMsg={setMsg} msg={msg.msg} state={msg.state} />}
        {/* Reusable Button */}
        <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
        <View className="mt-3">
          <SecondaryButton title="Back" onPress={() => navigation.goBack()} />
        </View>
        <View className="mt-4">
          <TertiaryButton
            title="Forgot Password?"
            onPress={() => console.log('Forgot Password')}
          />
        </View>
      </View>

      {/* Footer */}
      <View className="items-center mt-8">
        <Text className="text-gray-600">
          Don’t have an account?{' '}
          <Text className="text-blue-600 font-semibold">Sign Up</Text>
        </Text>
      </View>
    </View>
  );
}

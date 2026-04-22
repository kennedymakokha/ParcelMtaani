import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AuthInput } from '../components/AuthInput'; // reusable input
import { PrimaryButton } from '../components/PrimaryButton'; // reusable button
import { SecondaryButton } from '../components/SecondaryButton';
import { TertiaryButton } from '../components/TertiaryButton';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome6'
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  // const handleLogin = async () => {
  //   setLoading(true);
  //   try {
  //     // Simulate API call
  //     setTimeout(() => {
  //       setLoading(false);
  //       navigation.navigate("DashboardStack");
  //     }, 2000);
  //   } catch (err) {
  //     setLoading(false);
  //     console.error("Login failed:", err);
  //   }
  // };
  const handleLogin = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        // Example: backend returns full user object
        const fetchedUser = {
          id: 'u123',
          name: 'Makokha',
          email,
          role: 'staff' as const,
          avatar: 'https://via.placeholder.com/80',
          token: 'mock-jwt-token',
        };

        // ✅ Store full user in context
        setUser(fetchedUser);

        setLoading(false);
        navigation.navigate('DashboardStack');
      }, 2000);
    } catch (err) {
      setLoading(false);
      console.error('Login failed:', err);
    }
  };
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
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

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

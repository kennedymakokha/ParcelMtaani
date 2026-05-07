/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/themeContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useSelector } from 'react-redux';
export default function SplashScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useSelector((state: any) => state.auth);
  console.log(user);
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check token or auth state here
      navigation.replace('Login'); // or 'Dashboard' if already authenticated
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Logo / Branding */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="truck-fast" size={74} color={colors.text} />
      </View>
      <Text
        style={{ fontSize: 28, fontWeight: '700', color: colors.secondary }}
      >
        Parcel Mtaani
      </Text>
      {/* <TypewriterEffect title speed={300} text="Coming soon..."/> */}
      <Text style={{ fontSize: 14, color: colors.subText, marginTop: 8 }}>
        Secure Parcel Management
      </Text>

      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

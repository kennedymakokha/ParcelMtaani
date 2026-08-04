/* eslint-disable react-native/no-inline-styles */
import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    mode: string;
    background: string;
    text: string;
    border: string;
    card: string;
    error: string;
    subText?: string;
    success?: string;
    warning?: string;
    textSecondary?: string;
    primaryLight?: string;
    errorLight?: string;
    successLight?: string;
    fontRegular?: string;
    fontMedium?: string;
    fontSemiBold?: string;
    fontBold?: string;
    shadow?: string;
    overlay?: string;
    warningLight?: string;
  };
  typography: {
    heading: string;
    body: string;
    small: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#f97316',
    danger: '#dc2626',
    background: '#f9fafb',
    text: '#111827',
    border: '#d1d5db',
    mode: 'light',
    subText: '#6b7280',
    card: '#ffffff',
    textSecondary: '#9ca3af',
    error: '#dc2626',
    errorLight: '#fee2e2',
    primaryLight: '#3b82f6',
    success: '#15803d',
    warning: '#d97706',
    successLight: '#d1fae5',
    shadow: '#000',
    fontRegular: 'Inter-Regular',
    fontMedium: 'Inter-Medium',
    fontSemiBold: 'Inter-SemiBold',
    fontBold: 'Inter-Bold',
    warningLight: '',
  },
  typography: {
    heading: 'text-2xl font-bold',
    body: 'text-base text-gray-700',
    small: 'text-sm text-gray-500',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#fb923c',
    danger: '#f87171',
    background: '#111827',
    text: '#f9fafb',
    border: '#374151',
    mode: 'dark',
    subText: '#9ca3af',
    card: '#1f2937',
    errorLight: '#fee2e2',
    textSecondary: '#6b7280',
    error: '#f87171',
    primaryLight: '#60a5fa',
    success: '#22c55e',
    warning: '#fbbf24',
    successLight: '#d1fae5',
    fontRegular: 'Inter-Regular',
    fontMedium: 'Inter-Medium',
    fontSemiBold: 'Inter-SemiBold',
    fontBold: 'Inter-Bold',
    shadow: '#000',
    warningLight: '',
  },
  typography: {
    heading: 'text-2xl font-bold',
    body: 'text-base text-gray-200',
    small: 'text-sm text-gray-400',
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const scheme = useColorScheme();
  const baseTheme = scheme === 'dark' ? darkTheme : lightTheme;

  // 1. Extract raw values securely
  const pickupState = useSelector(
    (state: RootState) => state.pickupEvents?.lastEvent,
  );
  const pickup = useSelector((state: any) => state.pickups?.currentPickup);

  // 2. Build explicit safety boundaries
  const isPickupShut = pickupState === 'pickup_shut';
  const isNotPaid =
    pickup && Object.keys(pickup).length > 0
      ? pickup.paid === false || pickup.paid === 'false'
      : false;

  console.log(pickup);
  // 3. Combine statuses
  const isInactive = pickup?.paid === false || pickup?.paid === 'false';
  useEffect(() => {
    console.log('🎨 ThemeProvider Pickup Changed:', pickup);
    console.log('🎨 Paid Status:', pickup?.paid);
    console.log('🎨 isInactive:', isInactive);
  }, [pickup, isInactive]);
  // Guard clause: If the pickup object isn't loaded yet, default to NOT shutting down the UI

  // console.log(isInactive);
  // console.log('--- SYSTEM STATUS WATCHER ---');
  // console.log('Raw Pickup Object Status:', pickup);
  // console.log('Evaluated Unpaid Boolean (isNotPaid):', isNotPaid);
  // console.log('Evaluated Closed Boolean (isPickupShut):', isPickupShut);
  // console.log('Final Grayscale Active State (isInactive):', isInactive);

  const theme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      // Keep colors dynamic only if an intentional lock is requested
      primary: isInactive ? '#9ca3af' : baseTheme.colors.primary,
      primaryLight: isInactive ? '#d1d5db' : baseTheme.colors.primaryLight,
      success: isInactive ? '#9ca3af' : baseTheme.colors.success,
      warning: isInactive ? '#9ca3af' : baseTheme.colors.warning,
      danger: isInactive ? '#9ca3af' : baseTheme.colors.danger,
      text: isInactive ? '#6b7280' : baseTheme.colors.text,
      card: isInactive ? '#f3f4f6' : baseTheme.colors.card,
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      <View style={{ flex: 1 }}>
        {children}

        {isInactive && pickup && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(128, 128, 128, 0.45)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                paddingHorizontal: 28,
                paddingVertical: 18,
                borderRadius: 14,
              }}
            >
              {/* <Text
                style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}
              >
                {isPickupShut
                  ? '🔒 We are closed for today'
                  : '⚠️ Payment required to continue'}
              </Text> */}
            </View>
          </View>
        )}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

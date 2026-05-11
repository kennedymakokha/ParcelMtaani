/* eslint-disable react-native/no-inline-styles */
import React, { createContext, useContext } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
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
    secondary: '#6b7280',
    danger: '#dc2626',
    background: '#f9fafb',
    text: '#111827',
    border: '#d1d5db',
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
    secondary: '#9ca3af',
    danger: '#f87171',
    background: '#111827',
    text: '#f9fafb',
    border: '#374151',
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

  const pickupState = useSelector(
    (state: RootState) => state.pickupEvents.lastEvent,
  );

  const user = useSelector((state: RootState) => state.auth.user);

  const isPickupShut = pickupState === 'pickup_shut';
  const isNotPaid = user?.pickup?.paid === false;

  const isInactive = isPickupShut || isNotPaid;

  const theme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,

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

        {isInactive && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(128,128,128,0.12)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 999,
            }}
          >
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.15)',
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {isPickupShut
                  ? 'We are closed for today'
                  : 'Payment required to continue'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
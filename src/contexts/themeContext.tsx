import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

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
    subText?: string; // Optional for less prominent text
    success?: string; // Optional for success messages
    warning?: string; // Optional for warning messages
    textSecondary?: string; // Optional for placeholder text and less prominent text
    primaryLight?: string; // Optional lighter shade for selected states
    errorLight?: string; // Optional lighter shade for error states
    successLight?: string; // Optional lighter shade for success states
    fontRegular?: string;
    fontMedium?: string;
    fontSemiBold?: string;
    fontBold?: string;
  };
  typography: {
    heading: string;
    body: string;
    small: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#2563eb', // Blue accent
    secondary: '#6b7280', // Neutral gray
    danger: '#dc2626',
    background: '#f9fafb',
    text: '#111827',
    border: '#d1d5db',
    subText: '#6b7280',
    card: '#ffffff',
    textSecondary: '#9ca3af',
    error: '#dc2626',
    errorLight: '#fee2e2', // Lighter red for error states
    primaryLight: '#3b82f6', // Lighter blue for selected states
    success: '#15803d', // Green for success messages
    warning: '#d97706', // Amber for warning messages
    successLight: '#d1fae5', // Lighter green for success states

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
    primary: '#3b82f6', // Slightly lighter blue for dark mode
    secondary: '#9ca3af', // Gray
    danger: '#f87171',
    background: '#111827',
    text: '#f9fafb',
    border: '#374151',
    subText: '#9ca3af',
    card: '#1f2937',
    errorLight: '#fee2e2', // Lighter red for error states in dark mode
    textSecondary: '#6b7280',
    error: '#f87171',
    primaryLight: '#60a5fa', // Even lighter blue for selected states in dark mode
    success: '#22c55e', // Brighter green for success messages in dark mode
    warning: '#fbbf24', // Brighter amber for warning messages in dark mode
    successLight: '#d1fae5', // Lighter green for success states in dark mode
    fontRegular: 'Inter-Regular',
    fontMedium: 'Inter-Medium',
    fontSemiBold: 'Inter-SemiBold',
    fontBold: 'Inter-Bold',
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
  const scheme = useColorScheme(); // "light" or "dark"
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

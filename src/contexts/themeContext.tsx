import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    heading: string;
    body: string;
    small: string;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: "#2563eb",   // Blue accent
    secondary: "#6b7280", // Neutral gray
    danger: "#dc2626",
    background: "#f9fafb",
    text: "#111827",
    border: "#d1d5db",
  },
  typography: {
    heading: "text-2xl font-bold",
    body: "text-base text-gray-700",
    small: "text-sm text-gray-500",
  },
};

const darkTheme: Theme = {
  colors: {
    primary: "#3b82f6",   // Slightly lighter blue for dark mode
    secondary: "#9ca3af", // Gray
    danger: "#f87171",
    background: "#111827",
    text: "#f9fafb",
    border: "#374151",
  },
  typography: {
    heading: "text-2xl font-bold",
    body: "text-base text-gray-200",
    small: "text-sm text-gray-400",
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const scheme = useColorScheme(); // "light" or "dark"
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

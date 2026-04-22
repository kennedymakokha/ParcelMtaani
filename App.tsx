import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import './global.css';

// Screens
import RootStack from "./src/navigations/stacks/rootStack";
import { ThemeProvider, useTheme } from "./src/contexts/themeContext";
import { AuthProvider } from "./src/contexts/AuthContext";



function AppNavigator() {
  const { colors } = useTheme();
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          text: colors.text,
          primary: colors.primary,
          border: colors.border,
        },
      }}
    >
     <RootStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

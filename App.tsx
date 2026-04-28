import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import './global.css';

// Screens
import RootStack from './src/navigations/stacks/rootStack';
import { ThemeProvider, useTheme } from './src/contexts/themeContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistor, store } from './store';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SocketProvider } from './src/contexts/socketContext';
import AuthStack from './src/navigations/stacks/authStack';
import { StatusBar } from 'react-native';

function AppNavigator() {
  const { colors } = useTheme();
  // const { user } = useAuth();
   const { user } = useSelector((state: any) => state.auth);
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
       <StatusBar animated backgroundColor={colors.primary} />
     {user ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <SocketProvider>
                <AppNavigator />
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

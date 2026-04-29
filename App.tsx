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
import { PermissionsAndroid, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Alert } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getToken } from '@react-native-firebase/messaging';
function AppNavigator() {
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          console.log('Notification permission denied');
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in system settings to receive sales alerts.',
            [{ text: 'OK' }],
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };
  useEffect(() => {
    async function getFcmToken() {
      const messagingInstance = getMessaging();
      const token = await getToken(messagingInstance);
      setItem(prev => ({ ...prev, FcmToken: token }));
    }

    getFcmToken();
  }, []);
  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!hasPermission) {
          Alert.alert(
            'Stay Updated',
            'Would you like to receive notifications for new sales and stock alerts?',
            [
              { text: 'No thanks', style: 'cancel' },
              { text: 'OK', onPress: () => requestNotificationPermission() },
            ],
          );
        }
      }
    };

    checkPermission();
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        if (!hasPermission) {
          Alert.alert(
            'Stay Updated',
            'Would you like to receive notifications for new sales and stock alerts?',
            [
              { text: 'No thanks', style: 'cancel' },
              { text: 'OK', onPress: () => requestNotificationPermission() },
            ],
          );
        }
      }
    };

    checkPermission();
  }, []);
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

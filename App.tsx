import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import './global.css';

// Screens
import RootStack from './src/navigations/stacks/rootStack';
import { ThemeProvider, useTheme } from './src/contexts/themeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistor, store } from './store';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SocketProvider } from './src/contexts/socketContext';
import AuthStack from './src/navigations/stacks/authStack';
import { Alert, PermissionsAndroid, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Linking } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';

function AppNavigator() {
  const { colors } = useTheme();
  // const { user } = useAuth();
  const { user } = useSelector((state: any) => state.auth);
  const requestNotificationPermission = async () => {
    console.log('status');
    console.log(Platform.Version);
    if (Platform.OS === 'android' && Platform.Version >= 33) {
    
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      
      if (status === PermissionsAndroid.RESULTS.GRANTED) {
       
      } else if (status === PermissionsAndroid.RESULTS.DENIED) {
        
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Enable Notifications',
          'You have permanently disabled notifications. Enable them from settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);
  useEffect(() => {
    getMessaging()
      .getToken()
      .then(token => {
        console.log('🔥 NEW FCM TOKEN:', token);
      });
  }, []);
  useEffect(() => {
    const unsubscribe = getMessaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground message:', remoteMessage);
    });

    return unsubscribe;
  }, []);


useEffect(() => {
  const subscribe = async () => {
    try {
      await getMessaging().subscribeToTopic('parcel-updates');
      console.log('✅ Subscribed to topic');
    } catch (e) {
      console.log('❌ Topic subscribe error:', e);
    }
  };

  subscribe();
}, []);
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

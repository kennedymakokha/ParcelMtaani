/* eslint-disable react-hooks/exhaustive-deps */
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import './global.css';

// Screens
import RootStack from './src/navigations/stacks/rootStack';
import { ThemeProvider, useTheme } from './src/contexts/themeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { persistor, store } from './store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SocketProvider, useSocket } from './src/contexts/socketContext';
import AuthStack from './src/navigations/stacks/authStack';
import { Alert, PermissionsAndroid, StatusBar } from 'react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Linking } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { addNotification } from './src/features/notificationsSlice';
import messaging from '@react-native-firebase/messaging';
function AppNavigator() {
  const { colors } = useTheme();
  // const { user } = useAuth();
  const { socket } = useSocket();
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const requestNotificationPermission = async () => {
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
    // Foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      dispatch(
        addNotification({
          id: remoteMessage.messageId || Date.now().toString(),
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
          read: false,
          createdAt: Date.now(),
        }),
      );
    });

    // Background / Quit
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      dispatch(
        addNotification({
          id: remoteMessage.messageId || Date.now().toString(),
          title: remoteMessage.notification?.title || 'Notification',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data,
          read: false,
          createdAt: Date.now(),
        }),
      );
    });

    return unsubscribe;
  }, [dispatch]);
 

  useEffect(() => {
    const subscribe = async () => {
      try {
        await getMessaging().subscribeToTopic('parcel-updates');
      } catch (e) {
        console.log('❌ Topic subscribe error:', e);
      }
    };

    subscribe();
  }, []);
  useEffect(() => {
    if (!socket) return;

    const onSuccessfullDelivery = async (newPickup: any) => {
      console.log(newPickup);
      //
    };

    socket.on('Successful Delivery', onSuccessfullDelivery);
    return () => {
      socket.off('Successful Delivery', onSuccessfullDelivery);
    };
  }, [socket]);

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

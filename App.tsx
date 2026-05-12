/* eslint-disable react-hooks/exhaustive-deps */

import './global.css';

import React, { useEffect } from 'react';

import {
  Alert,
  AppState,
  Linking,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';

import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Provider, useDispatch, useSelector } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

import messaging from '@react-native-firebase/messaging';

import { persistor, store } from './store';

import RootStack from './src/navigations/stacks/rootStack';
import AuthStack from './src/navigations/stacks/authStack';

import {
  ThemeProvider,
  useTheme,
} from './src/contexts/themeContext';

import { AuthProvider } from './src/contexts/AuthContext';

import {
  SocketProvider,
  useSocket,
} from './src/contexts/socketContext';

import { addNotification } from './src/features/notificationsSlice';

import { usePickupSocket } from './src/hooks/usePickupSocket';

import PickupUserSync from './src/screens/syncUserNevents';



function AppNavigator() {
  const { colors } = useTheme();

  const dispatch = useDispatch();

  const { socket } = useSocket();

  const { user } = useSelector(
    (state: any) => state.auth,
  );

  usePickupSocket();

  // ✅ NOTIFICATION PERMISSION
  const requestNotificationPermission =
    async () => {
      try {
        if (
          Platform.OS === 'android' &&
          Number(Platform.Version) >= 33
        ) {
          const status =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS
                .POST_NOTIFICATIONS,
            );

          if (
            status ===
            PermissionsAndroid.RESULTS
              .NEVER_ASK_AGAIN
          ) {
            Alert.alert(
              'Enable Notifications',
              'Notifications are disabled. Enable them from settings.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Open Settings',
                  onPress: () =>
                    Linking.openSettings(),
                },
              ],
            );
          }
        }
      } catch (error) {
        console.log(
          '❌ Permission error:',
          error,
        );
      }
    };

  // ✅ REQUEST PERMISSION
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ✅ GET FCM TOKEN
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await messaging().getToken();

        console.log('🔥 FCM TOKEN:', token);
      } catch (error) {
        console.log(
          '❌ Token error:',
          error,
        );
      }
    };

    getToken();
  }, []);

  // ✅ FOREGROUND NOTIFICATIONS
  useEffect(() => {
    const unsubscribe = messaging().onMessage(
      async remoteMessage => {
        dispatch(
          addNotification({
            id:
              remoteMessage.messageId ||
              Date.now().toString(),

            title:
              remoteMessage.notification
                ?.title || 'Notification',

            body:
              remoteMessage.notification
                ?.body || '',

            data: remoteMessage.data,

            read: false,

            createdAt: Date.now(),
          }),
        );
      },
    );

    return unsubscribe;
  }, [dispatch]);

  // ✅ TOPIC SUBSCRIPTION
  useEffect(() => {
    const subscribe = async () => {
      try {
        await messaging().subscribeToTopic(
          'parcel-updates',
        );

        console.log(
          '✅ Subscribed to parcel-updates',
        );
      } catch (e) {
        console.log(
          '❌ Topic subscribe error:',
          e,
        );
      }
    };

    subscribe();
  }, []);

  // ✅ SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    const onSuccessfulDelivery = (
      newPickup: any,
    ) => {
      console.log(
        '✅ Successful Delivery:',
        newPickup,
      );
    };

    socket.on(
      'Successful Delivery',
      onSuccessfulDelivery,
    );

    return () => {
      socket.off(
        'Successful Delivery',
        onSuccessfulDelivery,
      );
    };
  }, [socket]);

  // ✅ APP STATE
  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      state => {
        if (state === 'active') {
          console.log('📱 App Active');
        }
      },
    );

    return () => {
      sub.remove();
    };
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
      <PickupUserSync />

      <StatusBar
        animated
        backgroundColor={colors.primary}
        barStyle="light-content"
      />

      {user ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={null}
      >
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
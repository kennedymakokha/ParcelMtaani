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

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Provider, useDispatch, useSelector } from 'react-redux';

import { PersistGate } from 'redux-persist/integration/react';

import messaging from '@react-native-firebase/messaging';

import { persistor, store } from './store';

import RootStack from './src/navigations/stacks/rootStack';
import AuthStack from './src/navigations/stacks/authStack';

import { ThemeProvider, useTheme } from './src/contexts/themeContext';

import { AuthProvider } from './src/contexts/AuthContext';

import { SocketProvider, useSocket } from './src/contexts/socketContext';

import { BusinessProvider } from './src/contexts/BusinessContext';

import { addNotification } from './src/features/notificationsSlice';

import { usePickupSocket } from './src/hooks/usePickupSocket';

import PickupUserSync from './src/screens/syncUserNevents';
import { setCurrentPickup } from './src/features/pickSlice';
import { loadArchivedNotifications } from './src/utils/loadArchivedNotifications';
import {
  unsubscribeAllTopics,
  unsubscribeFromTopic,
} from './src/utils/subscribeUnsubscribe';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLogoutMutation } from './src/services/apis/auth.api';
import { logout } from './src/features/auth/authSlice';

function AppNavigator() {
  const { colors } = useTheme();

  const dispatch = useDispatch();
  const [logoutUser] = useLogoutMutation();
  const { socket } = useSocket();

  const { user } = useSelector((state: any) => state.auth);
  const currentPickup = useSelector(
    (state: any) => state.pickups.currentPickup,
  );
  usePickupSocket();

  /**
   * NOTIFICATION PERMISSION
   */
  useEffect(() => {
    // dispatch(clearNotifications());
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
          const status = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );

          if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
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
                  onPress: () => Linking.openSettings(),
                },
              ],
            );
          }
        }
      } catch (error) {
        console.log('❌ Notification permission error:', error);
      }
    };

    requestNotificationPermission();
  }, []);

  /**
   * GET FCM TOKEN
   */
  useEffect(() => {
    const fetchFcmToken = async () => {
      try {
        const token = await messaging().getToken();

        console.log('🔥 FCM TOKEN:', token);
      } catch (error) {
        console.log('❌ FCM token error:', error);
      }
    };

    fetchFcmToken();
  }, []);

  /**
   * FOREGROUND NOTIFICATIONS
   */
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
    
      const messageData = remoteMessage.data || {};

      const title =
        typeof remoteMessage.notification?.title === 'string'
          ? remoteMessage.notification.title
          : typeof messageData.title === 'string'
          ? messageData.title
          : 'Notification';

      const body =
        typeof remoteMessage.notification?.body === 'string'
          ? remoteMessage.notification.body
          : typeof messageData.body === 'string'
          ? messageData.body
          : '';

      dispatch(
        addNotification({
          id: remoteMessage.messageId || Date.now().toString(),

          title,

          body,

          data: messageData,

          read: false,

          createdAt: Date.now(),
        }),
      );
    });

    return unsubscribe;
  }, []);

  /**
   * TOPIC SUBSCRIPTION
   */
  useEffect(() => {
    const subscribeToGlobalTopics = async () => {
      try {
        await messaging().subscribeToTopic('parcel-updates');

        console.log('✅ Subscribed to parcel-updates');
      } catch (e) {
        console.log('❌ Topic subscription error:', e);
      }
    };

    subscribeToGlobalTopics();
  }, []);

  /**
   * SOCKET EVENTS
   */
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onSuccessfulDelivery = (payload: any) => {
      console.log('✅ Successful Delivery:', payload);
    };
    const ForceLogout = async (payload: any) => {
      console.log(payload)
      try {
        /**
         * UNSUBSCRIBE FROM ALL USER TOPICS
         */

        await unsubscribeAllTopics(user);

        /**
         * EXTRA SAFETY UNSUBSCRIBE
         */

        if (currentPickup?._id) {
          await unsubscribeFromTopic(`pickup_${currentPickup._id}_attendants`);
        }

        if (user?.business?._id) {
          await unsubscribeFromTopic(`business_${user.business._id}_crew`);

          await unsubscribeFromTopic(`business_${user.business._id}_admin`);
        }

        /**
         * GLOBAL TOPICS
         */
        await unsubscribeFromTopic('parcel-updates');

        /**
         * SOCKET CLEANUP
         */
        if (socket?.disconnect) {
          socket.disconnect();
        }

        /**
         * CLEAR STORAGE
         */
        await AsyncStorage.multiRemove([
          'accessToken',
          'userId',
          'tokenExpiry',
        ]);

        /**
         * CLEAR REDUX
         */
        dispatch(setCurrentPickup(null));
        await logoutUser({}).unwrap();
        dispatch(logout());
      } catch (error) {
        console.log('Logout error:', error);
      }

      loadArchivedNotifications(dispatch);
     
    };
    const restoreNotifications = (payload: any) => {
      loadArchivedNotifications(dispatch);
      console.log(payload);
    };
    const updatePickup = (payload: any) => {
      const freshPickup = payload.data?.pickup;

      if (freshPickup) {
        dispatch(setCurrentPickup(freshPickup));
      }
    };
    socket.on('Successful Delivery', onSuccessfulDelivery);
    socket.on('Restore Notifications', restoreNotifications);
    socket.on('Force Logout', ForceLogout);
    const currentPickupId = user.pickup._id;
    socket.on(`pickup_${currentPickupId}`, updatePickup);
    return () => {
      socket.off('Successful Delivery', onSuccessfulDelivery);
      socket.off('Restore Notifications', restoreNotifications);
      socket.off('Force Logout', ForceLogout);
    };
  }, [socket]);

  /**
   * APP STATE LISTENER
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        console.log('📱 App Active');
      }
    });

    return () => {
      subscription.remove();
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
        backgroundColor={colors.card}
        barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'}
      />

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
                <BusinessProvider>
                  <AppNavigator />
                </BusinessProvider>
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

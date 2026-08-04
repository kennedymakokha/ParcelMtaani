/**
 * @format
 */

import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { name as appName } from './app.json';

import { store } from './store';

import { addNotification } from './src/features/notificationsSlice';
import { setPickupEvent } from './src/features/pickupEventsSlice';
import { setCurrentPickup } from './src/features/pickSlice';

const parsePickupData = (data: any) => {
  try {
    if (!data) return null;

    if (typeof data === 'string') {
      return JSON.parse(data);
    }

    return data;
  } catch (error) {
    console.log('❌ Failed to parse pickup data:', error);
    return null;
  }
};

const handlePickupUpdate = (remoteMessage: any) => {
  try {
    const event = remoteMessage?.data?.event_name;

    const pickupData = parsePickupData(
      remoteMessage?.data?.data,
    );

    console.log('📦 Parsed Pickup:', pickupData);

    if (event) {
      store.dispatch(
        setPickupEvent({
          event,
          payload: remoteMessage.data || {},
          timestamp: Date.now(),
        }),
      );
    }

    if (pickupData) {
      store.dispatch(
        setCurrentPickup(pickupData),
      );

      console.log(
        '✅ Pickup Updated:',
        store.getState().pickups?.currentPickup,
      );
    }
  } catch (error) {
    console.log(
      '❌ Pickup update handler error:',
      error,
    );
  }
};

// =====================================================
// FOREGROUND
// =====================================================
messaging().onMessage(
  async remoteMessage => {
    console.log(
      '📩 Foreground Message:',
      remoteMessage,
    );

    store.dispatch(
      addNotification({
        id:
          remoteMessage.messageId ||
          Date.now().toString(),
        title:
          remoteMessage.notification?.title ||
          'Notification',
        body:
          remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        read: false,
        createdAt: Date.now(),
      }),
    );

    handlePickupUpdate(remoteMessage);
  },
);

// =====================================================
// BACKGROUND / QUIT
// =====================================================
messaging().setBackgroundMessageHandler(
  async remoteMessage => {
    console.log(
      '📩 Background Message:',
      remoteMessage,
    );

    store.dispatch(
      addNotification({
        id:
          remoteMessage.messageId ||
          Date.now().toString(),
        title:
          remoteMessage.notification?.title ||
          'Notification',
        body:
          remoteMessage.notification?.body || '',
        data: remoteMessage.data || {},
        read: false,
        createdAt: Date.now(),
      }),
    );

    handlePickupUpdate(remoteMessage);
  },
);

// =====================================================
// APP OPENED FROM BACKGROUND
// =====================================================
messaging().onNotificationOpenedApp(
  remoteMessage => {
    console.log(
      '📲 Opened From Background:',
      remoteMessage,
    );

    handlePickupUpdate(remoteMessage);
  },
);

// =====================================================
// APP OPENED FROM QUIT STATE
// =====================================================
messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log(
        '🚀 Opened From Quit State:',
        remoteMessage,
      );

      handlePickupUpdate(remoteMessage);
    }
  });

AppRegistry.registerComponent(
  appName,
  () => App,
);
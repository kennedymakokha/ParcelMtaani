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

// ✅ BACKGROUND / QUIT STATE HANDLER
messaging().setBackgroundMessageHandler(
  async remoteMessage => {
    try {
      console.log(
        '📩 Background Message:',
        remoteMessage,
      );

      // SAVE NOTIFICATION
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

      // HANDLE SOCKET/PICKUP EVENTS
      const event =
        remoteMessage?.data?.event_name;

      if (event) {
        store.dispatch(
          setPickupEvent({
            event,
            payload: remoteMessage.data || {},
            timestamp: Date.now(),
          }),
        );
      }
    } catch (error) {
      console.log(
        '❌ Background handler error:',
        error,
      );
    }
  },
);

AppRegistry.registerComponent(
  appName,
  () => App,
);
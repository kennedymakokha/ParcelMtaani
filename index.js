/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';

import { store } from './store';
import { addNotification } from './src/features/notificationsSlice';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  store.dispatch(
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

AppRegistry.registerComponent(appName, () => App);
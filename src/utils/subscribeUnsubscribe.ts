import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

const messaging = getMessaging(getApp());

export const subscribeToTopic = async (topic: string) => {
  if (!topic) return;

  try {
    return await messaging.subscribeToTopic(topic);
  } catch (e) {
    console.error('Subscribe error:', topic, e);
  }
};

export const unsubscribeFromTopic = async (topic: string) => {
  if (!topic) return;

  try {
    return await messaging.unsubscribeFromTopic(topic);
  } catch (e) {
    console.error('Unsubscribe error:', topic, e);
  }
};
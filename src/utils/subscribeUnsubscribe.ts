import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

const messaging = getMessaging(getApp());

/**
 * Subscribe to FCM topic
 */
export const subscribeToTopic = async (
  topic: string,
): Promise<boolean> => {
  try {
    const cleanTopic = topic?.trim();

    if (!cleanTopic) {
      console.log('⚠️ Invalid topic supplied');

      return false;
    }

    await messaging.subscribeToTopic(cleanTopic);

    console.log(
      `✅ Subscribed to topic: ${cleanTopic}`,
    );

    return true;
  } catch (e) {
    console.error(
      `❌ Subscribe error for topic: ${topic}`,
      e,
    );

    return false;
  }
};

/**
 * Unsubscribe from FCM topic
 */
export const unsubscribeFromTopic = async (
  topic: string,
): Promise<boolean> => {
  try {
    const cleanTopic = topic?.trim();

    if (!cleanTopic) {
      console.log('⚠️ Invalid topic supplied');

      return false;
    }

    await messaging.unsubscribeFromTopic(cleanTopic);

    console.log(
      `✅ Unsubscribed from topic: ${cleanTopic}`,
    );

    return true;
  } catch (e) {
    console.error(
      `❌ Unsubscribe error for topic: ${topic}`,
      e,
    );

    return false;
  }
};

/**
 * Subscribe to multiple topics
 */
export const subscribeToTopics = async (
  topics: string[],
): Promise<void> => {
  try {
    await Promise.all(
      topics.map(topic =>
        subscribeToTopic(topic),
      ),
    );
  } catch (e) {
    console.error(
      '❌ Bulk subscribe error:',
      e,
    );
  }
};

/**
 * Unsubscribe from multiple topics
 */
export const unsubscribeFromTopics = async (
  topics: string[],
): Promise<void> => {
  try {
    await Promise.all(
      topics.map(topic =>
        unsubscribeFromTopic(topic),
      ),
    );
  } catch (e) {
    console.error(
      '❌ Bulk unsubscribe error:',
      e,
    );
  }
};

/**
 * Logout helper
 */
export const unsubscribeAllTopics = async (
  user: any,
  currentPickup?: any,
): Promise<void> => {
  try {
    const topics: string[] = [];

    /**
     * Global
     */
    topics.push('parcel-updates');

    /**
     * Pickup
     */
    if (currentPickup?._id) {
      topics.push(
        `pickup_${currentPickup._id}_attendants`,
      );
    }

    /**
     * Business
     */
    if (user?.business?._id) {
      topics.push(
        `business_${user.business._id}_crew`,
      );

      topics.push(
        `business_${user.business._id}_admin`,
      );
    }

    /**
     * Roles
     */
    if (user?.role === 'superuser') {
      topics.push('superuser');
    }

    if (user?.role === 'supersales') {
      topics.push('supersales');
    }

    await unsubscribeFromTopics(topics);

    console.log(
      '✅ All topics unsubscribed successfully',
    );
  } catch (e) {
    console.error(
      '❌ Failed to unsubscribe all topics',
      e,
    );
  }
};
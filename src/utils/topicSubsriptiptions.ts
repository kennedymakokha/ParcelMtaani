import { getApp } from '@react-native-firebase/app';
import { getMessaging } from '@react-native-firebase/messaging';

// ✅ Single Firebase Messaging instance (IMPORTANT)
const messaging = getMessaging(getApp());

/**
 * Resolve all topics based on user role
 */
export const resolveTopics = (user: any): string[] => {
    const topics: string[] = [];

    if (!user) return topics;

    // Role-based topics
    if (user.role === 'driver') {
        topics.push('drivers');
    }

    if (user.role === 'superuser') {
        topics.push('superusers');
    }

    if (user.role === 'admin') {
        topics.push('admins');
    }

    if (user.role === 'superadmin') {
        topics.push('superadmins');
    }

    if (user.role === 'supersales') {
        topics.push('supersales');
    }

    // Pickup-based attendants
    if (user.role === 'attendant' && user.pickup?._id) {
        topics.push(`pickup_${user.pickup._id}_attendants`);
    }

    return topics;
};

/**
 * Subscribe user to all relevant topics
 */
export const subscribeToTopics = async (user: any) => {
    const topics = resolveTopics(user);

    if (!topics.length) return;

    try {
        await Promise.all(
            topics.map(topic => messaging.subscribeToTopic(topic))
        );
    } catch (error) {
        console.error('Error subscribing to topics:', error);
    }
};

/**
 * Unsubscribe user from all relevant topics
 */
export const unsubscribeAllTopics = async (user: any) => {
    const topics = resolveTopics(user);

    if (!topics.length) return;

    try {
        await Promise.all(
            topics.map(topic => messaging.unsubscribeFromTopic(topic))
        );
    } catch (error) {
        console.error('Error unsubscribing from topics:', error);
    }
};

/**
 * Subscribe to a single topic (safe helper)
 */
export const subscribeToTopic = async (topic: string) => {
    if (!topic) return;

    try {
        return await messaging.subscribeToTopic(topic);
    } catch (error) {
        console.error('Subscribe failed:', topic, error);
    }
};

/**
 * Unsubscribe from a single topic (safe helper)
 */
export const unsubscribeFromTopic = async (topic: string) => {
    if (!topic) return;

    try {
        return await messaging.unsubscribeFromTopic(topic);
    } catch (error) {
        console.error('Unsubscribe failed:', topic, error);
    }
};
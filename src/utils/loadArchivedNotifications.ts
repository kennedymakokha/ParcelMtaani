import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreArchivedNotifications } from '../features/notificationsSlice';

export const loadArchivedNotifications = async (
    dispatch: any,
) => {
    try {
        const stored = await AsyncStorage.getItem(
            'ARCHIVED_NOTIFICATIONS',
        );


        if (stored) {
            const notifications = JSON.parse(stored);

            dispatch(
                restoreArchivedNotifications(notifications),
            );
        }

    } catch (error) {
        console.log(
            'Failed to restore notifications:',
            error,
        );
    }
};

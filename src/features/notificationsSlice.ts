import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

interface NotificationsState {
  list: Notification[];
}

const initialState: NotificationsState = {
  list: [],
};

const ARCHIVED_NOTIFICATIONS_KEY = 'ARCHIVED_NOTIFICATIONS';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,

reducers: {
    addNotification: (
      state,
      action: PayloadAction<Notification>,
    ) => {
      state.list.unshift(action.payload);
    },


    markAsRead: (
      state,
      action: PayloadAction<string>,
    ) => {
      const notif = state.list.find(
        n => n.id === action.payload,
      );

      if (notif) {
        notif.read = true;
      }
    },

    markAllAsRead: state => {
      state.list = state.list.map(notification => ({
        ...notification,
        read: true,
      }));
    },

    clearNotifications: state => {
      // Save copy before clearing
      AsyncStorage.setItem(
        ARCHIVED_NOTIFICATIONS_KEY,
        JSON.stringify(state.list),
      ).catch(error => {
        console.log(
          'Failed to archive notifications:',
          error,
        );
      });

      state.list = [];
    },

    restoreArchivedNotifications: (
      state,
      action: PayloadAction<Notification[]>,
    ) => {
      state.list = action.payload;
    },


  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  restoreArchivedNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

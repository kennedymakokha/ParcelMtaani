import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.list.unshift(action.payload); // newest first
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.list.find(n => n.id === action.payload);
      if (notif) notif.read = true;
    },
    clearNotifications: state => {
      state.list = [];
    },
  },
});

export const { addNotification, markAsRead, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;

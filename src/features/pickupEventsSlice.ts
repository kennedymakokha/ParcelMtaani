// src/features/pickupEvents/pickupEventsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PickupEventState {
  lastEvent: string | null;
  timestamp: number | null;
}

const initialState: PickupEventState = {
  lastEvent: 'pickup_open', // default state
  timestamp: Date.now(),
};

const pickupEventsSlice = createSlice({
  name: 'pickupEvents',
  initialState,
  reducers: {
    setPickupEvent: (
      state,
      action: PayloadAction<{ event: string; timestamp: number }>,
    ) => {
      state.lastEvent = action.payload.event;
      state.timestamp = action.payload.timestamp;
    },
  },
});

export const { setPickupEvent } = pickupEventsSlice.actions;

export default pickupEventsSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pickup, PickupState } from '../../types';

interface ExtendedPickupState extends PickupState {
  currentPickup: Pickup | null;
}

const initialState: ExtendedPickupState = {
  pickups: [],
  page: 1,
  totalPages: 1,
  currentPickup: null,
};

interface SetPickupsPayload {
  pickups: Pickup[];
  page: number;
  totalPages: number;
}

const pickupSlice = createSlice({
  name: 'pickups',
  initialState,
  reducers: {
    setPickups: (state, action: PayloadAction<SetPickupsPayload>) => {
      state.pickups = action.payload.pickups;
      state.page = action.payload.page;
      state.totalPages = action.payload.totalPages;

      // optional: auto-set first pickup if none selected
    //   if (!state.currentPickup && action.payload?.pickups?.length > 0) {
    //     state.currentPickup = action.payload?.pickups[0];
    //   }
    },

    setCurrentPickup: (state, action: PayloadAction<Pickup>) => {
      state.currentPickup = action.payload;
    },

    addPickup: (state, action: PayloadAction<Pickup>) => {
      state.pickups.push(action.payload);
    },

    clearPickups: (state) => {
      state.pickups = [];
      state.page = 1;
      state.totalPages = 1;
      state.currentPickup = null;
    },
  },
});

export const {
  setPickups,
  addPickup,
  clearPickups,
  setCurrentPickup,
} = pickupSlice.actions;

export default pickupSlice.reducer;
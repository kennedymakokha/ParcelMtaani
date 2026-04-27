// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { api } from "./src/services";
import authReducer from "./src/features/auth/authSlice";
import pickupReducer from './src/features/pickSlice';
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["token", "user"],
};



const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const persistedPickupReducer = persistReducer(
  { key: "pickups", storage: AsyncStorage },
  pickupReducer
);


export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    pickups: persistedPickupReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

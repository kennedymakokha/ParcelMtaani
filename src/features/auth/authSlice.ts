import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    user: {
        name?: string;
        email?: string;
        profilePic?: string;
        [key: string]: any;
    } | null;
}

const initialState: AuthState = {
    token: null,
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ token: string; user: any }>
        ) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logout: state => {
            state.token = null;
            state.user = null;
        },
        updateProfile: (
            state,
            action: PayloadAction<{ name?: string; email?: string; profilePic?: string }>
        ) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload, // merge updated fields into user object
                };
            }
        },
    },
});

export const { setCredentials, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;

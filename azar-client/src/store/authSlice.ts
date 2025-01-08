// src/store/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {LoginResponse} from "../models/models.ts";
import {getAuthToken} from "../utils/AppState.ts";

interface AuthState {
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    isLoggedIn: !!getAuthToken(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<LoginResponse>) {
            const loginResponse = action.payload;
            if (loginResponse.success) {
                state.isLoggedIn = true;
            } else {
                state.isLoggedIn = false;
            }
        },
        logout(state) {
            state.isLoggedIn = false;
        },
    },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;

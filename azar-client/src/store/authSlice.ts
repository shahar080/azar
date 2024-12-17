// src/store/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {LoginResponse, UserType} from "../models/models.ts";

interface AuthState {
    isLoggedIn: boolean;
    username: string;
    userType: UserType;
}

const initialState: AuthState = {
    isLoggedIn: !!localStorage.getItem('authToken'),
    username: '',
    userType: UserType.STANDARD,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<LoginResponse>) {
            const loginResponse = action.payload;
            if (loginResponse.success) {
                state.isLoggedIn = true;
                state.username = loginResponse.token;
                state.userType = loginResponse.userType;
            } else {
                state.isLoggedIn = false;
            }
        },
        logout(state) {
            state.isLoggedIn = false;
            state.username = '';
        },
    },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;

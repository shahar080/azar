// src/store/authSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {LoginResponse, UserType} from "../models/models.ts";

interface AuthState {
    isLoggedIn: boolean;
    token: string | null;
    username: string;
    userType: UserType;
}

const initialState: AuthState = {
    isLoggedIn: !!localStorage.getItem('authToken'),
    token: localStorage.getItem('authToken'),
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
                state.username = loginResponse.userName;
                state.token = loginResponse.token;
                state.userType = loginResponse.userType;
            } else {
                state.isLoggedIn = false;
            }
        },
        logout(state) {
            state.isLoggedIn = false;
            state.username = '';
            state.token = '';
            state.userType = UserType.STANDARD;
        },
    },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;

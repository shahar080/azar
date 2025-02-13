import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getAuthToken} from "../utils/AppState.ts";
import {LoginResponse} from "../server/api/responses.ts";

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
            state.isLoggedIn = loginResponse.success;
        },
        logout(state) {
            state.isLoggedIn = false;
        },
    },
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;

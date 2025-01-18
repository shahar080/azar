import axios from 'axios';
import {logout} from "../../../cloud/store/authSlice.ts";
import {getAuthToken, setAuthToken} from "../../../cloud/utils/AppState.ts";
import {TOKEN_REFRESH_API} from "../../../cloud/utils/constants.ts";
import {BASE_URL_API} from "../../utils/constants.ts";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: BASE_URL_API,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const token = getAuthToken();
if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export async function refreshToken(): Promise<string | null> {
    try {
        const response = await apiClient.post(TOKEN_REFRESH_API, {}, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`, // Use old token
            },
        });

        const {token} = response.data;

        if (token) {
            setAuthToken(token); // Save new token
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return token;
        }

        console.error('Token refresh failed: No new token returned');
        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
}


apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
    (response) => response, // Pass valid responses through
    async (error) => {
        console.error('Interceptor caught error:', error);

        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshToken();
                if (newToken) {

                    // Update request headers with new token
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                    // Retry the failed request
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                logout(); // Redirect to login if refresh fails
            }
        }

        return Promise.reject(error); // Reject if token refresh fails
    }
);
export default apiClient;

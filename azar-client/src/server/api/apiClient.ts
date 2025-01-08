import axios from 'axios';
import {logout} from "../../store/authSlice.ts";
import {getAuthToken, setAuthToken} from "../../utils/AppState.ts";

// Create an Axios instance
const apiClient = axios.create({
    baseURL: "https://shahar-azar.com/api",
    // baseURL: "http://127.0.0.1:8080/api",
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
        const response = await apiClient.post('/token/refresh', {}, {
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

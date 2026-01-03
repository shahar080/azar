import axios, {AxiosError, AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig,} from 'axios';
import {logout} from '../../store/authSlice.ts';
import {getAuthToken, setAuthToken} from '../../utils/AppState.ts';
import {TOKEN_REFRESH_API} from '../../../cloud/utils/constants.ts';
import {BASE_URL_API} from '../../utils/constants.ts';
import {secondsUntilExpiry} from "../../utils/jwt.ts";

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        _retry?: boolean;
        skipRefreshCheck?: boolean;
    }
}

const REFRESH_THRESHOLD_SECONDS = 30;

const apiClient = axios.create({
    baseURL: BASE_URL_API,
    timeout: 30000,
    headers: {'Content-Type': 'application/json'},
});

let refreshPromise: Promise<string | null> | null = null;

export async function refreshToken(): Promise<string | null> {
    if (!refreshPromise) {
        const current = getAuthToken();
        refreshPromise = (async () => {
            try {
                const resp = await apiClient.post(
                    TOKEN_REFRESH_API,
                    {},
                    {
                        headers: current
                            ? ({Authorization: `Bearer ${current}`} as AxiosRequestHeaders)
                            : ({} as AxiosRequestHeaders),
                    }
                );
                const data = resp.data as { token?: string };
                if (data?.token) {
                    setAuthToken(data.token);
                    return data.token;
                }
                return null;
            } catch {
                return null;
            } finally {
                refreshPromise = null;
            }
        })();
    }
    return refreshPromise;
}

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        if (config.skipRefreshCheck) {
            return config;
        }

        let token = getAuthToken();

        const secs = secondsUntilExpiry(token);
        if (secs !== null && secs <= REFRESH_THRESHOLD_SECONDS) {
            const newToken = await refreshToken();
            if (newToken) token = newToken;
        }

        if (token) {
            const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
            headers.Authorization = `Bearer ${token}`;
            config.headers = headers;
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const original = error.config;
        const status = error.response?.status;

        if (!original) return Promise.reject(error);

        const isRefreshCall =
            typeof original.url === 'string' &&
            original.url.includes(TOKEN_REFRESH_API);

        if (status === 401 && !original._retry && !isRefreshCall) {
            original._retry = true;

            const newToken = await refreshToken();
            if (newToken) {
                const headers: AxiosRequestHeaders = (original.headers || {}) as AxiosRequestHeaders;
                headers.Authorization = `Bearer ${newToken}`;
                original.headers = headers;
                return apiClient(original);
            }

            logout();
        }

        return Promise.reject(error);
    }
);

export default apiClient;

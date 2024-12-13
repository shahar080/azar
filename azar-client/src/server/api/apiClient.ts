import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptors if needed (e.g., for authentication tokens)
// apiClient.interceptors.request.use(
//     (config) => {
//         // Add auth token to headers if necessary
//         const token = localStorage.getItem('token'); // Example
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

export default apiClient;

import apiClient from "./apiClient.ts";
import {UserNameAndPassword} from "../../models/models.ts"

export async function login(userNameAndPassword: UserNameAndPassword): Promise<boolean> {
    try {
        const response = await apiClient.post('/user/login', userNameAndPassword);
        const {token} = response.data;

        if (token) {
            // Securely store the token
            localStorage.setItem('authToken', token);
            console.log('Login successful:', token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

export async function add() {
    const user = {
        "firstName": "test",
        "lastName": "test",
        "userName": "test",
        "password": "test"
    }
    await apiClient.post('/user/ops/add', user);
}
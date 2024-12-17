import apiClient from "./apiClient.ts";
import {LoginResponse, User, UserNameAndPassword} from "../../models/models.ts"

export async function login(userNameAndPassword: UserNameAndPassword): Promise<LoginResponse | undefined> {
    try {
        const response = await apiClient.post('/user/login', userNameAndPassword);
        const loginResponse: LoginResponse = response.data;
        if (loginResponse && loginResponse.success) {
            // Securely store the token
            localStorage.setItem('authToken', loginResponse.token);
            return loginResponse;
        }
        return undefined;
    } catch (error) {
        console.error('Login failed:', error);
        return undefined;
    }
}

export async function add(userName: string, userToAdd: User): Promise<boolean> {
    const req = {
        "currentUser": userName,
        "userToAdd": userToAdd
    }
    try {
        const response = await apiClient.post('/user/ops/add', req);
        return response.status === 201;
    } catch (error) {
        console.error('Create user failed:', error);
        return false;
    }

}
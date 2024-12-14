import apiClient from "./apiClient.ts";
import {User, UserNameAndPassword} from "../../models/models.ts"

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
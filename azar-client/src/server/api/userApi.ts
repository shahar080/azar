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

export async function getAllUsers(page: number = 1, limit: number = 20): Promise<User[]> {
    try {
        const response = await apiClient.get<User[]>(`/user/getAll?page=${page}&limit=${limit}`);
        const users: User[] = response.data;
        return users || []; // Return empty array if no data
    } catch (error) {
        console.error(`Error getting users from server (page: ${page})!`, error);
        return [];
    }
}

export async function deleteUser(userId: string, userName: string): Promise<boolean> {
    try {
        const response = await apiClient.post(`/user/ops/delete/${userId}`, userName);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Delete user ' + userId + ' failed', error);
    }
    return false;
}

export async function updateUser(updatedUser: User): Promise<User | undefined> {
    try {
        const response = await apiClient.post('/user/ops/update', updatedUser);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update user ' + updatedUser.id + ' failed', error);
    }
    return undefined;
}
import apiClient from "./apiClient.ts";
import {LoginResponse, User} from "../../models/models.ts"
import {BaseRequest, UserAddRequest, UserLoginRequest, UserUpdateRequest} from "./requests.ts";

export async function login(userLoginRequest: UserLoginRequest): Promise<LoginResponse | undefined> {
    try {
        const response = await apiClient.post('/user/login', userLoginRequest);
        const loginResponse: LoginResponse = response.data;
        if (loginResponse && loginResponse.success) {
            // Securely store the token
            localStorage.setItem('authToken', loginResponse.token);
            localStorage.setItem('userName', loginResponse.userName); // TODO: AZAR-68
            localStorage.setItem('userType', loginResponse.userType);
            return loginResponse;
        }
        return undefined;
    } catch (error) {
        console.error('Login failed:', error);
        return undefined;
    }
}

export async function add(userAddRequest: UserAddRequest): Promise<boolean> {

    try {
        const response = await apiClient.post('/user/ops/add', userAddRequest);
        return response.status === 201;
    } catch (error) {
        console.error('Create user failed:', error);
        return false;
    }
}

export async function getAllUsers(baseRequest: BaseRequest, page: number = 1, limit: number = 20): Promise<User[]> {
    try {
        const response = await apiClient.post<User[]>(`/user/getAll?page=${page}&limit=${limit}`, baseRequest);
        const users: User[] = response.data;
        return users || []; // Return empty array if no data
    } catch (error) {
        console.error(`Error getting users from server (page: ${page})!`, error);
        return [];
    }
}

export async function deleteUser(userId: string, baseRequest: BaseRequest): Promise<boolean> {
    try {
        const response = await apiClient.post(`/user/ops/delete/${userId}`, baseRequest);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Delete user ' + userId + ' failed', error);
    }
    return false;
}

export async function updateUser(userUpdateRequest: UserUpdateRequest): Promise<User | undefined> {
    try {
        const response = await apiClient.post('/user/ops/update', userUpdateRequest);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update user ' + userUpdateRequest.user.id + ' failed', error);
    }
    return undefined;
}
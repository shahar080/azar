import apiClient from "./apiClient.ts";
import {User} from "../../../cloud/models/models.ts"
import {BaseRequest, UserLoginRequest, UserUpsertRequest} from "../../../cloud/server/api/requests.ts";
import {setAuthToken, setUserId, setUserName, setUserType} from "../../utils/AppState.ts";
import {USER_ADD_API, USER_DELETE_API, USER_LOGIN_API, USER_UPDATE_API} from "../../../cloud/utils/constants.ts";
import {LoginResponse} from "../../../cloud/server/api/responses.ts";

export async function login(userLoginRequest: UserLoginRequest): Promise<LoginResponse | undefined> {
    try {
        const response = await apiClient.post(USER_LOGIN_API, userLoginRequest);
        const loginResponse: LoginResponse = response.data;
        if (loginResponse && loginResponse.success) {
            // Securely store the token
            setAuthToken(loginResponse.token);
            setUserName(loginResponse.userName);
            setUserType(loginResponse.userType);
            setUserId(String(loginResponse.userId));
            return loginResponse;
        }
        return undefined;
    } catch (error) {
        console.error('Login failed:', error);
        return undefined;
    }
}

export async function add(userAddRequest: UserUpsertRequest): Promise<boolean> {

    try {
        const response = await apiClient.post(USER_ADD_API, userAddRequest);
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
        const response = await apiClient.post(USER_DELETE_API + userId, baseRequest);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Delete user ' + userId + ' failed', error);
    }
    return false;
}

export async function updateUser(userUpdateRequest: UserUpsertRequest): Promise<User | undefined> {
    try {
        const response = await apiClient.post(USER_UPDATE_API, userUpdateRequest);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update user ' + userUpdateRequest.user.id + ' failed', error);
    }
    return undefined;
}
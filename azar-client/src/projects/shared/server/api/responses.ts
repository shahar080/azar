import {UserType} from "../../../cloud/models/models.ts";

export interface LoginResponse {
    success: boolean;
    token: string;
    userName: string;
    userType: UserType;
    userId: number;
}
import {BaseModel} from "../../shared/models/models";

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    userType: string;
}

export interface UserNameAndPassword {
    userName: string;
    password: string;
}

export enum UserType {
    ADMIN = "ADMIN",
    STANDARD = "STANDARD",
}

export function getUserTypeFromStr(value: string | null): UserType {
    if (value === null || value === undefined) {
        return UserType.STANDARD;
    }
    if (Object.values(UserType).includes(value as UserType)) {
        return value as UserType;
    }
    return UserType.STANDARD;
}

export interface PdfFile extends BaseModel {
    id: string;
    uploadedBy: string;
    fileName: string;
    data: string;
    contentType: string;
    labels: string[];
    size: string;
    uploadedAt: string;
    description: string;
}

export interface Preference extends BaseModel {
    key: string;
    value: string;
    userId: number;
}
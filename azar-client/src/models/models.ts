export interface User {
    id?: string;
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

export function getUserType(value: string | null): UserType {
    if (value === null || value === undefined) {
        return UserType.STANDARD;
    }
    // Check if the value exists in the enum
    if (Object.values(UserType).includes(value as UserType)) {
        return value as UserType;
    }
    // Return the default value if not found
    return UserType.STANDARD;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    userName: string;
    userType: UserType;
}

export interface PdfFile {
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
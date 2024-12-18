export interface User {
    id: string;
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

export interface LoginResponse {
    success: boolean;
    token: string;
    userType: UserType;
}

export interface PdfFile {
    id: string;
    fileName: string;
    data: string;
    contentType: string;
    labels: string[];
    size: string;
    uploadedAt: string;
    description: string;
}
import {PdfFile, User, UserNameAndPassword} from "../../models/models.ts";

export interface BaseRequest {
    currentUser: string;
}

export interface UserAddRequest extends BaseRequest {
    userToAdd: User;
}

export interface UserLoginRequest extends BaseRequest {
    userNameAndPassword: UserNameAndPassword;
}

export interface UserUpdateRequest extends BaseRequest {
    user: User;
}

export interface PdfUpdateRequest extends BaseRequest {
    pdfFile: PdfFile;
}
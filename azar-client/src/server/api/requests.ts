import {PdfFile, Preference, User, UserNameAndPassword} from "../../models/models.ts";

export interface BaseRequest {
    currentUser: string;
}

export interface UserLoginRequest extends BaseRequest {
    userNameAndPassword: UserNameAndPassword;
}

export interface UserUpsertRequest extends BaseRequest {
    user: User;
}

export interface PdfUpdateRequest extends BaseRequest {
    pdfFile: PdfFile;
}

export interface PreferenceUpsertRequest extends BaseRequest {
    preference: Preference;
}

export interface PreferenceGetAllRequest extends BaseRequest {
    userId: string;
}
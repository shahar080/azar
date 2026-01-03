import {BaseRequest} from "../../../shared/server/api/requests.ts";
import {PdfFile, Preference, User, UserNameAndPassword} from "../../models/models.ts";

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
    userId: number;
}

export interface PreferenceGetAllRequest extends BaseRequest {
    userId: number;
}

export interface PdfDeleteRequest extends BaseRequest {
    userName: string;
}
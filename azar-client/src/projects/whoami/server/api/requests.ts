import {EmailData, WhoAmIData} from "../../models/models.ts";
import {BaseRequest, EmptyBaseRequest} from "../../../shared/server/api/requests.ts";


export interface EmailCVRequest extends EmptyBaseRequest {
    email: string;
}

export interface UpdateWhoAmIDataRequest extends BaseRequest {
    whoAmIData: WhoAmIData;
}

export interface UpdateEmailDataRequest extends BaseRequest{
    emailData: EmailData;
}
import {CV, WhoAmIData} from "../../models/models.ts";
import {BaseRequest, EmptyBaseRequest} from "../../../shared/server/api/requests.ts";


export interface EmailCVRequest extends EmptyBaseRequest {
    email: string;
}

export interface UpdateWhoAmIDataRequest extends BaseRequest {
    whoAmIData: WhoAmIData;
}

export interface UpdateCVRequest extends BaseRequest{
    cv: CV;
}
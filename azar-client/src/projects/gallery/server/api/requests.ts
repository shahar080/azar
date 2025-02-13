import {BaseRequest} from "../../../shared/server/api/requests.ts";
import {Photo} from "../../models/models.ts";

export interface PhotoUpdateRequest extends BaseRequest {
    photo: Photo;
}
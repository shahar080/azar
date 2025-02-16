import {BaseRequest} from "../../../shared/server/api/requests.ts";
import {GpsMetadata, Photo} from "../../models/models.ts";

export interface PhotoUpdateRequest extends BaseRequest {
    photo: Photo;
}

export interface PhotoReverseGeocodeRequest extends BaseRequest {
    photoId: string;
    gpsMetadata: GpsMetadata;
}
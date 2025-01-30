import {EmptyBaseRequest} from "../../../shared/server/api/requests.ts";


export interface GetByLatLongRequest extends EmptyBaseRequest {
    latitude: string;
    longitude: string;
}


export interface GetCitiesByInputRequest extends EmptyBaseRequest {
    input: string;
}
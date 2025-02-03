import {EmptyBaseRequest} from "../../../shared/server/api/requests.ts";


export interface WeatherLatLongRequest extends EmptyBaseRequest {
    latitude: string;
    longitude: string;
}


export interface CitiesByInputRequest extends EmptyBaseRequest {
    input: string;
}

export interface ForecastLatLongRequest extends EmptyBaseRequest {
    latitude: string;
    longitude: string;
}
import {EmptyBaseRequest} from "../../../shared/server/api/requests.ts";


export interface WeatherLatLongRequest extends EmptyBaseRequest {
    latitude: number;
    longitude: number;
}


export interface CitiesByInputRequest extends EmptyBaseRequest {
    input: string;
}

export interface ForecastLatLongRequest extends EmptyBaseRequest {
    latitude: number;
    longitude: number;
}
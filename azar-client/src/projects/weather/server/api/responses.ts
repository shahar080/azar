import {
    ForecastCity,
    LatLongClouds,
    LatLongCoord,
    LatLongMain,
    LatLongSys,
    LatLongWeatherObject,
    LatLongWind
} from "../../models/models.ts";

interface BaseResponse {
    weather: LatLongWeatherObject[];
    main: LatLongMain;
    visibility: number;
    wind: LatLongWind;
    clouds: LatLongClouds;
    dt: number;
}

export interface WeatherLatLongResponse extends BaseResponse {
    coord: LatLongCoord;
    base: string;
    sys: LatLongSys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
}

export interface ForecastLatLongResponse {
    cod: number;
    message: string;
    cnt: number;
    list: BaseResponse[];
    city: ForecastCity;
}
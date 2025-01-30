import {
    LatLongClouds,
    LatLongCoord,
    LatLongMain,
    LatLongSys,
    LatLongWeatherObject,
    LatLongWind
} from "../../models/models.ts";

export interface GetByLatLongResponse {
    coord: LatLongCoord;
    weather: LatLongWeatherObject[];
    base: string;
    main: LatLongMain;
    visibility: number;
    wind: LatLongWind;
    clouds: LatLongClouds;
    dt: number;
    sys: LatLongSys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
}
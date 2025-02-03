import apiClient from "../../../shared/server/api/apiClient.ts";
import {
    GET_CITIES_BY_INPUT_API,
    GET_FORECAST_BY_LAT_LONG_API,
    GET_WEATHER_BY_LAT_LONG_API
} from "../../utils/constants.ts";
import {CitiesByInputRequest, ForecastLatLongRequest, WeatherLatLongRequest} from "./requests.ts";
import {ForecastLatLongResponse, WeatherLatLongResponse} from "./responses.ts";
import {DBWeatherLocation} from "../../models/models.ts";

export async function getWeatherByLatLong(getByLatLongRequest: WeatherLatLongRequest): Promise<WeatherLatLongResponse> {
    try {
        const response = await apiClient.post(GET_WEATHER_BY_LAT_LONG_API, getByLatLongRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        throw error;
    }
}

export async function getCitiesByInput(getCitiesByInputRequest: CitiesByInputRequest): Promise<DBWeatherLocation[]> {
    try {
        const response = await apiClient.post(GET_CITIES_BY_INPUT_API, getCitiesByInputRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        throw error;
    }
}

export async function getForecastByLatLong(forecastLatLongRequest: ForecastLatLongRequest): Promise<ForecastLatLongResponse> {
    try {
        const response = await apiClient.post(GET_FORECAST_BY_LAT_LONG_API, forecastLatLongRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        throw error;
    }
}
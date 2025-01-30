import apiClient from "../../../shared/server/api/apiClient.ts";
import {GET_BY_LAT_LONG_API, GET_CITIES_BY_INPUT_API} from "../../utils/constants.ts";
import {GetByLatLongRequest, GetCitiesByInputRequest} from "./requests.ts";
import {GetByLatLongResponse} from "./responses.ts";
import {DBWeatherLocation} from "../../models/models.ts";

export async function getByLatLong(getByLatLongRequest: GetByLatLongRequest): Promise<GetByLatLongResponse> {
    try {
        const response = await apiClient.post(GET_BY_LAT_LONG_API, getByLatLongRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        throw error;
    }
}

export async function getCitiesByInput(getCitiesByInputRequest: GetCitiesByInputRequest): Promise<DBWeatherLocation[]> {
    try {
        const response = await apiClient.post(GET_CITIES_BY_INPUT_API, getCitiesByInputRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch cities:", error);
        throw error;
    }
}
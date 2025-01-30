import apiClient from "../../../shared/server/api/apiClient.ts";
import {GET_BY_LAT_LONG_API} from "../../utils/constants.ts";
import {GetByLatLongRequest} from "./requests.ts";
import {GetByLatLongResponse} from "./responses.ts";

export async function getByLatLong(getByLatLongRequest: GetByLatLongRequest): Promise<GetByLatLongResponse> {
    try {
        const response = await apiClient.post(GET_BY_LAT_LONG_API, getByLatLongRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        throw error;
    }
}
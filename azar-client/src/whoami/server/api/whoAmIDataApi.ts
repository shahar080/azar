import apiClient from "../../../shared/server/api/apiClient.ts";
import {WhoAmIData} from "../../models/models.ts";
import {UpdateWhoAmIDataRequest} from "./requests.ts";
import {WHO_AM_I_GET_API, WHO_AM_I_UPDATE_API} from "../../utils/constants.ts";

export async function getWhoAmIData(): Promise<WhoAmIData> {
    try {
        const response = await apiClient.post(WHO_AM_I_GET_API);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch WhoAmIData", error);
        throw error;
    }
}

export async function updateWhoAmIData(updateWhoAmIDataRequest: UpdateWhoAmIDataRequest): Promise<WhoAmIData> {
    try {
        const response = await apiClient.post(WHO_AM_I_UPDATE_API, updateWhoAmIDataRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to update WhoAmIData", error);
        throw error;
    }
}
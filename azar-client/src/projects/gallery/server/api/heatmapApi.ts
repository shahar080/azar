import apiClient from "../../../shared/server/api/apiClient.ts";
import {HEATMAP_GET_PHOTOS_API} from "../../utils/constants.ts";
import {Photo} from "../../models/models.ts";

export async function getPhotos(): Promise<Photo[]> {
    try {
        const response = await apiClient.get(HEATMAP_GET_PHOTOS_API);

        return response.data;
    } catch (error) {
        console.error("Failed to get heatmap photos", error);
        throw error;
    }
}
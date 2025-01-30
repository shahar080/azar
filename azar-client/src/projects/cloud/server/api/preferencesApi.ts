import {PreferenceGetAllRequest, PreferenceUpsertRequest} from "./requests.ts";
import apiClient from "../../../shared/server/api/apiClient.ts";
import {Preference} from "../../models/models.ts";
import {PREFERENCE_GET_ALL_API, PREFERENCE_UPDATE_API} from "../../utils/constants.ts";

export async function getAllPreferences(preferenceGetAllRequest: PreferenceGetAllRequest, page: number = 1, limit: number = 20): Promise<Preference[]> {
    try {
        const response = await apiClient.post<Preference[]>(PREFERENCE_GET_ALL_API + `?page=${page}&limit=${limit}`, preferenceGetAllRequest);
        const preferences: Preference[] = response.data;
        return preferences || [];
    } catch (error) {
        console.error(`Error getting preferences from server (page: ${page})!`, error);
        return [];
    }
}

export async function updatePreference(preferenceUpdateRequest: PreferenceUpsertRequest): Promise<Preference | undefined> {
    try {
        const response = await apiClient.post(PREFERENCE_UPDATE_API, preferenceUpdateRequest);
        return response.data;
    } catch (error) {
        console.error('Update preference ' + preferenceUpdateRequest.preference.id + ' failed', error);
    }
    return undefined;
}
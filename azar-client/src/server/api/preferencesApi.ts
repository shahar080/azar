import {BaseRequest, PreferenceGetAllRequest, PreferenceUpsertRequest} from "./requests.ts";
import apiClient from "./apiClient.ts";
import {Preference} from "../../models/models.ts";
import {PREFERENCE_ADD_API, PREFERENCE_DELETE_API, PREFERENCE_UPDATE_API} from "../../utils/constants.ts";

export async function add(preferenceAddRequest: PreferenceUpsertRequest): Promise<boolean> {

    try {
        const response = await apiClient.post(PREFERENCE_ADD_API, preferenceAddRequest);
        return response.status === 201;
    } catch (error) {
        console.error('Create preference failed:', error);
        return false;
    }
}

export async function getAllPreferences(preferenceGetAllRequest: PreferenceGetAllRequest, page: number = 1, limit: number = 20): Promise<Preference[]> {
    try {
        const response = await apiClient.post<Preference[]>(`/preference/getAll?page=${page}&limit=${limit}`, preferenceGetAllRequest);
        const preferences: Preference[] = response.data;
        return preferences || []; // Return empty array if no data
    } catch (error) {
        console.error(`Error getting preferences from server (page: ${page})!`, error);
        return [];
    }
}

export async function deletePreference(preferenceId: string, baseRequest: BaseRequest): Promise<boolean> {
    try {
        const response = await apiClient.post(PREFERENCE_DELETE_API + preferenceId, baseRequest);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Delete preference ' + preferenceId + ' failed', error);
    }
    return false;
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
import apiClient from "../../../shared/server/api/apiClient.ts";
import {EmailData} from "../../models/models.ts";
import {UpdateEmailDataRequest} from "./requests.ts";
import {EMAIL_GET_API, EMAIL_UPDATE_API} from "../../utils/constants.ts";

export async function getEmailData(): Promise<EmailData> {
    try {
        const response = await apiClient.post(EMAIL_GET_API);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch email data", error);
        throw error;
    }
}

export async function updateEmailData(updateEmailDataRequest: UpdateEmailDataRequest): Promise<boolean> {
    try {
        const response = await apiClient.post(EMAIL_UPDATE_API, updateEmailDataRequest);
        return response.status === 200;
    } catch (error) {
        console.error("Failed to update email data", error);
        throw error;
    }
}
import apiClient from "../../../shared/server/api/apiClient.ts";
import {EmailCVRequest, UpdateCVRequest} from "./requests.ts";
import {CV} from "../../models/models.ts";
import {CV_GET_API, CV_SEND_TO_EMAIL_API, CV_UPDATE_API} from "../../utils/constants.ts";

export async function getCV(): Promise<Blob> {
    try {
        const response = await apiClient.post(CV_GET_API, null, {
            responseType: "arraybuffer", // Fetch the response as a binary blob
        });

        return new Blob([response.data], {type: "application/pdf"});
    } catch (error) {
        console.error("Failed to fetch CV PDF:", error);
        throw error;
    }
}

export async function sendToEmail(emailCVRequest: EmailCVRequest): Promise<boolean> {
    try {
        const response = await apiClient.post(CV_SEND_TO_EMAIL_API, emailCVRequest);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Send pdf to ' + emailCVRequest.email + ' failed', error);
    }
    return false;
}

export async function updateCV(updateCVRequest: UpdateCVRequest): Promise<CV> {
    try {
        const response = await apiClient.post(CV_UPDATE_API, updateCVRequest);
        return response.data;
    } catch (error) {
        console.error("Failed to update cv", error);
        throw error;
    }
}
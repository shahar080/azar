import apiClient from "../../../shared/server/api/apiClient.ts";
import {EmailCVRequest} from "./requests.ts";

export async function getCV(): Promise<Blob> {
    try {
        const response = await apiClient.post('/cv/get', null, {
            responseType: "arraybuffer", // Fetch the response as a binary blob
        });

        // Convert the arraybuffer into a Blob
        return new Blob([response.data], {type: "application/pdf"});
    } catch (error) {
        console.error("Failed to fetch CV PDF:", error);
        throw error;
    }
}

export async function sendToEmail(emailCVRequest: EmailCVRequest): Promise<boolean> {
    try {
        const response = await apiClient.post('/cv/sendToEmail', emailCVRequest);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Send pdf to ' + emailCVRequest.email + ' failed', error);
    }
    return false;
}
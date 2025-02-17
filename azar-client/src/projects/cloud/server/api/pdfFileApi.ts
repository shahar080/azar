import apiClient from "../../../shared/server/api/apiClient.ts";
import {PdfFile} from "../../models/models.ts";
import {PdfUpdateRequest} from "./requests.ts";
import {
    PDF_DELETE_API,
    PDF_GET_ALL_API,
    PDF_GET_API,
    PDF_THUMBNAIL_API,
    PDF_UPDATE_API,
    PDF_UPLOAD_API
} from "../../utils/constants.ts";
import {BaseRequest} from "../../../shared/server/api/requests.ts";
import {AxiosError} from "axios";

export async function uploadPdf(pdfFile: File, userName: string): Promise<PdfFile | undefined> {
    try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("userName", userName);
        const response = await apiClient.post(PDF_UPLOAD_API, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        console.error('Upload pdf failed', error);
    }
    return undefined;
}

export async function deletePdf(pdfId: string, baseRequest: BaseRequest): Promise<number> {
    try {
        const response = await apiClient.post(PDF_DELETE_API + pdfId, baseRequest);
        return response.status;
    } catch (error: unknown) {
        console.error('Delete pdf ' + pdfId + ' failed', error);
        if (error instanceof AxiosError) {
            if (error.response && error.response.status) {
                return error.response.status;
            }
        }
    }
    return 400;
}

export async function updatePdf(pdfUpdateRequest: PdfUpdateRequest): Promise<PdfFile | undefined> {
    try {
        const response = await apiClient.post(PDF_UPDATE_API, pdfUpdateRequest);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update pdf ' + pdfUpdateRequest.pdfFile.id + ' failed', error);
    }
    return undefined;
}

export async function getAllPdfs(baseRequest: BaseRequest, page: number = 1, limit: number = 20): Promise<PdfFile[]> {
    try {
        const response = await apiClient.post<PdfFile[]>(PDF_GET_ALL_API + `?page=${page}&limit=${limit}`, baseRequest);
        const pdfFiles: PdfFile[] = response.data;
        return pdfFiles || [];
    } catch (error) {
        console.error(`Error getting PDFs from server (page: ${page})!`, error);
        return [];
    }
}

export const fetchPdfThumbnail = async (baseRequest: BaseRequest, pdfId: string): Promise<Blob> => {
    try {
        const response = await apiClient.post(PDF_THUMBNAIL_API + pdfId, baseRequest, {
            responseType: "blob",
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch PDF thumbnail:", error);
        throw error;
    }
};

export const fetchPDF = async (baseRequest: BaseRequest, pdfId: string): Promise<Blob> => {
    try {
        const response = await apiClient.post(PDF_GET_API + pdfId, baseRequest, {
            responseType: "blob",
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch PDF:", error);
        throw error;
    }
};

import apiClient from "./apiClient.ts";
import {PdfFile} from "../../models/models.ts";

export async function uploadPdf(pdfFile: File, userName: string): Promise<PdfFile | undefined> {
    try {
        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("userName", userName);
        const response = await apiClient.post('/pdf/upload', formData, {
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

export async function deletePdf(pdfId: string): Promise<boolean> {
    try {
        const response = await apiClient.post(`/pdf/delete/${pdfId}`);
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Delete pdf ' + pdfId + ' failed', error);
    }
    return false;
}

export async function updatePdf(updatedPdf: PdfFile): Promise<PdfFile | undefined> {
    try {
        const response = await apiClient.post('/pdf/update', updatedPdf);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update pdf ' + updatedPdf.id + ' failed', error);
    }
    return undefined;
}

export async function getAllPdfs(page: number = 1, limit: number = 20): Promise<PdfFile[]> {
    try {
        const response = await apiClient.get<PdfFile[]>(`/pdf/getAll?page=${page}&limit=${limit}`);
        const pdfFiles: PdfFile[] = response.data;
        return pdfFiles || []; // Return empty array if no data
    } catch (error) {
        console.error(`Error getting PDFs from server (page: ${page})!`, error);
        return [];
    }
}

export const fetchPdfThumbnail = async (pdfId: string): Promise<Blob> => {
    try {
        const response = await apiClient.get(`/pdf/thumbnail/${pdfId}`, {
            responseType: "blob", // Fetch the response as a binary blob
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch PDF thumbnail:", error);
        throw error;
    }
};


export const fetchPDF = async (pdfId: string): Promise<Blob> => {
    try {
        const response = await apiClient.get(`/pdf/get/${pdfId}`, {
            responseType: "blob", // Fetch the response as a binary blob
        });

        return response.data;
    } catch (error) {
        console.error("Failed to fetch PDF:", error);
        throw error;
    }
};


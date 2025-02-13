import apiClient from "../../../shared/server/api/apiClient.ts";
import {
    PHOTOS_DELETE_PHOTO_API,
    PHOTOS_GET_LIGHTWEIGHT_PHOTO_API,
    PHOTOS_GET_PHOTO_WITH_PHOTO_API,
    PHOTOS_GET_PHOTO_WITH_THUMBNAIL_API,
    PHOTOS_GET_PHOTOS_ID_API,
    PHOTOS_REFRESH_PHOTO_METADATA_API,
    PHOTOS_UPDATE_PHOTO_API,
    PHOTOS_UPLOAD_PHOTO_API
} from "../../utils/constants.ts";
import {Photo} from "../../models/models.ts";
import {AxiosError} from "axios";
import {BaseRequest} from "../../../shared/server/api/requests.ts";
import {PhotoUpdateRequest} from "./requests.ts";

export async function uploadPhoto(photoFile: File): Promise<Photo | undefined> {
    try {
        const formData = new FormData();
        formData.append("file", photoFile);
        const response = await apiClient.post(PHOTOS_UPLOAD_PHOTO_API, formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });
        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        console.error('Upload photo failed', error);
    }
    return undefined;
}

export async function getLightweightPhoto(imageId: number): Promise<Photo> {
    try {
        const response = await apiClient.post(PHOTOS_GET_LIGHTWEIGHT_PHOTO_API + imageId);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch photo with thumbnail:", error);
        throw error;
    }
}

export async function getPhotoWithThumbnail(imageId: number): Promise<Photo> {
    try {
        const response = await apiClient.post(PHOTOS_GET_PHOTO_WITH_THUMBNAIL_API + imageId);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch photo with thumbnail:", error);
        throw error;
    }
}

export const getPhotoWithPhoto = async (imageId: number): Promise<Photo> => {
    try {
        const response = await apiClient.post(PHOTOS_GET_PHOTO_WITH_PHOTO_API + imageId);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch photo with photo:", error);
        throw error;
    }
};

export async function getPhotosId(): Promise<number[]> {
    try {
        const response = await apiClient.get(PHOTOS_GET_PHOTOS_ID_API);

        return response.data;
    } catch (error) {
        console.error("Failed to fetch images id:", error);
        throw error;
    }
}

export async function deletePhoto(photoId: number, baseRequest: BaseRequest): Promise<number> {
    try {
        const response = await apiClient.post(PHOTOS_DELETE_PHOTO_API + photoId, baseRequest);
        return response.status;
    } catch (error: unknown) {
        console.error('Delete photo ' + photoId + ' failed', error);
        if (error instanceof AxiosError) {
            if (error.response && error.response.status) {
                return error.response.status;
            }
        }
    }
    return 400;
}

export async function refreshMetadata(photoId: number, baseRequest: BaseRequest): Promise<boolean> {
    try {
        const response = await apiClient.post(PHOTOS_REFRESH_PHOTO_METADATA_API + photoId, baseRequest);

        return response.status === 200;
    } catch (error) {
        console.error("Failed to refresh metadata for image id:" + photoId, error);
        throw error;
    }
}

export async function updatePhoto(photoUpdateRequest: PhotoUpdateRequest): Promise<Photo | undefined> {
    try {
        const response = await apiClient.post(PHOTOS_UPDATE_PHOTO_API, photoUpdateRequest);
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error('Update photo ' + photoUpdateRequest.photo.id + ' failed', error);
    }
    return undefined;
}
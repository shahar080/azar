export interface Photo {
    id: string;
    name: string;
    description: string;
    data: number[];
    thumbnail: number[];
    size: string;
    uploadedAt: string
    photoMetadata: PhotoMetadata;
}

export interface PhotoMetadata {
    id: string;
    imageHeight: string;
    imageWidth: string;
    cameraMake: string;
    cameraModel: string;
    dateTaken: string;
    gps: GpsMetadata;
}

export interface GpsMetadata {
    id: string;
    latitude: number;
    longitude: number;
    altitude: number;
}
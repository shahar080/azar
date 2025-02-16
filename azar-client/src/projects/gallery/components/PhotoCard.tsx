import {Card, CardActionArea, CardContent, Tooltip, Typography} from "@mui/material";
import PhotoThumbnail from "./PhotoThumbnail.tsx";
import React, {useEffect, useState} from "react";
import {getPhotoWithThumbnail} from "../server/api/photoApi.ts";
import {Photo} from "../models/models.ts";
import {base64ToUint8Array, byteArrayToString} from "../../shared/utils/utilities.ts";
import {formatAsDate, getFileName, truncateText} from "../../cloud/components/sharedLogic.ts";


interface PhotoCardProps {
    photoId: string;
    handleTouchStart: (photoId: string) => void;
    handleTouchEnd: () => void;
    handleThumbnailClick: (photoId: string) => void;
    onPhotoLoaded?: (photo: Photo) => void;
    cityCountry: string | undefined;
    viewMode: "web" | "modal";

}

const PhotoCard: React.FC<PhotoCardProps> = ({
                                                 photoId,
                                                 handleTouchStart,
                                                 handleTouchEnd,
                                                 handleThumbnailClick,
                                                 onPhotoLoaded,
                                                 cityCountry,
                                                 viewMode,
                                             }) => {
    const [photoCardPhoto, setPhotoCardPhoto] = useState<Photo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [photoDate, setPhotoDate] = useState<string>("");
    const [cardTooltip, setCardTooltip] = useState<string[]>([""]);

    const fetchData = () => {
        setIsLoading(true);

        getPhotoWithThumbnail(photoId)
            .then(value => {
                setPhotoCardPhoto(value);
                void (onPhotoLoaded && onPhotoLoaded(value));
            })
            .catch(error => console.error("Error fetching photo:", error))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const getTooltipData = (stringifiedDate: string): string[] => {
            const tooltipArr: string[] = [];
            if (photoCardPhoto) {
                void (photoCardPhoto.name && tooltipArr.push(`Name: ${photoCardPhoto.name}`));
                void (
                    photoCardPhoto.description &&
                    tooltipArr.push(`Description: ${photoCardPhoto.description.length > 100
                        ? photoCardPhoto.description.slice(0, 100) + "..."
                        : photoCardPhoto.description}`)
                );
                void (cityCountry && tooltipArr.push(`Location: ${cityCountry}`));
                void (photoCardPhoto.photoMetadata.imageHeight && tooltipArr.push(`Height: ${photoCardPhoto.photoMetadata.imageHeight}`));
                void (photoCardPhoto.photoMetadata.imageWidth && tooltipArr.push(`Width: ${photoCardPhoto.photoMetadata.imageWidth}`));
                void (photoCardPhoto.photoMetadata.cameraMake && tooltipArr.push(`CameraMake: ${photoCardPhoto.photoMetadata.cameraMake}`));
                void (photoCardPhoto.photoMetadata.cameraModel && tooltipArr.push(`CameraModel: ${photoCardPhoto.photoMetadata.cameraModel}`));
                void (stringifiedDate && tooltipArr.push(`Date: ${stringifiedDate}`));
            }
            return tooltipArr;
        }

        if (photoCardPhoto && photoCardPhoto.photoMetadata) {
            setPhotoDate(formatAsDate(photoCardPhoto.photoMetadata.dateTaken));
            setCardTooltip(getTooltipData(formatAsDate(photoCardPhoto.photoMetadata.dateTaken)))
        }
    }, [photoCardPhoto]);


    return (
        <Tooltip
            title={
                <div style={{whiteSpace: 'pre-line'}}>{cardTooltip.join('\n')}</div>
            }
            disableInteractive
            componentsProps={{
                tooltip: {
                    sx: {bgcolor: "primary.main", fontSize: "1rem"},
                },
            }}>
            <Card
                onTouchStart={() => handleTouchStart(photoId)}
                onTouchEnd={handleTouchEnd}
                style={{cursor: "context-menu"}}
                sx={{
                    cursor: "context-menu",
                    userSelect: "none",
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                }}
            >
                <CardActionArea onClick={() => handleThumbnailClick(photoId)}>
                    {isLoading || photoCardPhoto === null ? (
                            <Typography mt={"3vw"} variant={"h6"} color="primary">Loading photo...</Typography>
                        )
                        :
                        <>
                            <PhotoThumbnail
                                photoBlob={new Blob([base64ToUint8Array(byteArrayToString(photoCardPhoto.thumbnail))], {type: "image/png"})}
                                altText={photoCardPhoto.name}/>
                            <CardContent sx={{display: "flex", justifyContent: "space-between"}}>
                                <Typography variant="body2" color="text.secondary">
                                    {viewMode === "web" ? truncateText(getFileName(photoCardPhoto.name), 15) : truncateText(getFileName(photoCardPhoto.name), 8)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {photoDate}
                                </Typography>
                            </CardContent>
                        </>
                    }
                </CardActionArea>
            </Card>
        </Tooltip>
    );
}

export default PhotoCard;
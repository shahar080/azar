import {Card, CardActionArea, CardContent, Tooltip, Typography} from "@mui/material";
import PhotoThumbnail from "./PhotoThumbnail.tsx";
import React, {useEffect, useState} from "react";
import {getPhotoWithThumbnail} from "../server/api/photoApi.ts";
import {Photo} from "../models/models.ts";
import {base64ToUint8Array, byteArrayToString} from "../../shared/utils/utilities.ts";
import {formatAsDate} from "../../cloud/components/sharedLogic.ts";


interface PhotoCardProps {
    photoId: number;
    handleTouchStart: (photoId: number) => void;
    handleTouchEnd: () => void;
    handleThumbnailClick: (photoId: number) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({photoId, handleTouchStart, handleTouchEnd, handleThumbnailClick}) => {
    const [photo, setPhoto] = useState<Photo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [photoDate, setPhotoDate] = useState<string>("");
    const [cardTooltip, setCardTooltip] = useState<string[]>(["test1", "test12"]);

    const fetchData = () => {
        setIsLoading(true);

        getPhotoWithThumbnail(photoId)
            .then(value => setPhoto(value))
            .catch(error => console.error("Error fetching photo:", error))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const getTooltipData = (stringifiedDate: string): string[] => {
            const tooltipArr: string[] = [];
            if (photo) {
                void (photo.name && tooltipArr.push(`Name: ${photo.name}`));
                void (photo.description && tooltipArr.push(`Description: ${photo.description}`));
                void (photo.photoMetadata.imageHeight && tooltipArr.push(`Height: ${photo.photoMetadata.imageHeight}`));
                void (photo.photoMetadata.imageWidth && tooltipArr.push(`Width: ${photo.photoMetadata.imageWidth}`));
                void (photo.photoMetadata.cameraMake && tooltipArr.push(`CameraMake: ${photo.photoMetadata.cameraMake}`));
                void (photo.photoMetadata.cameraModel && tooltipArr.push(`CameraModel: ${photo.photoMetadata.cameraModel}`));
                void (stringifiedDate && tooltipArr.push(`Date: ${stringifiedDate}`));
            }
            return tooltipArr;
        }

        if (photo && photo.photoMetadata) {
            setPhotoDate(formatAsDate(photo.photoMetadata.dateTaken));
            setCardTooltip(getTooltipData(formatAsDate(photo.photoMetadata.dateTaken)))
        }
    }, [photo]);


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
                    {isLoading || photo === null ? (
                            <Typography mt={"3vw"} variant={"h6"} color="primary">Loading photo...</Typography>
                        )
                        :
                        <>
                            <PhotoThumbnail
                                photoBlob={new Blob([base64ToUint8Array(byteArrayToString(photo.thumbnail))], {type: "image/png"})}
                                altText={photo.name}/>
                            <CardContent sx={{display: "flex", justifyContent: "space-between"}}>
                                <Typography variant="body2" color="text.secondary">
                                    {photo.name}
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
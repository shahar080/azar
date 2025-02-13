import React, {useEffect, useRef, useState} from "react";
import {Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography,} from "@mui/material";
import {Close, FileDownload, ZoomIn, ZoomOut} from "@mui/icons-material";
import ShowBlob, {ShowBlobHandle} from "../../shared/components/ShowBlob";
import {getPhotoWithPhoto} from "../server/api/photoApi.ts";
import {base64ToUint8Array, byteArrayToString, resizeImageBlob} from "../../shared/utils/utilities";
import {Photo} from "../models/models.ts";

interface ShowPhotoModalProps {
    photoId: number;
    onClose: () => void;
}

//TODO AZAR-134
//  Combine zoom with ShowBlob.tsx [buggy atm]
//  align description columns on top
//  Fix double scroll bar
//  Horizontal scrollbar is big
const ShowPhotoModal: React.FC<ShowPhotoModalProps> = ({photoId, onClose}) => {
    const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);
    const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
    const [zoomAmount, setZoomAmount] = useState<number>(0);
    const [photo, setPhoto] = useState<Photo | null>(null);

    useEffect(() => {
        async function fetchPhoto() {
            return await getPhotoWithPhoto(photoId);
        }

        fetchPhoto()
            .then(value => {
                const byteArray = base64ToUint8Array(byteArrayToString(value.data));
                setOriginalBlob(new Blob([byteArray], {type: "image/png"}));
                setPhoto(value);
            });
    }, [photoId]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const {width, height} = entry.contentRect;
                setContainerSize({width, height});
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (originalBlob) {
            const targetWidth = containerSize.width || 1100;
            const targetHeight = containerSize.height || 1100;
            resizeImageBlob(originalBlob, targetWidth, targetHeight)
                .then((resized) => setResizedBlob(resized))
                .catch((err) => console.error("Error resizing image blob:", err));
        }
    }, [originalBlob, containerSize]);

    const showBlobRef = useRef<ShowBlobHandle>(null);

    const handleDownload = () => {
        if (resizedBlob) {
            const url = URL.createObjectURL(resizedBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `photo_${photoId}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const getTopInformation = () => {
        if (photo && photo.photoMetadata) {
            const items = [
                [photo.name, "Name:"],
                [photo.description, "Description:"],
                [photo.photoMetadata.imageWidth, "Width:"],
                [photo.photoMetadata.imageHeight, "Height:"],
                [photo.photoMetadata.dateTaken, "Date taken:"],
                [photo.photoMetadata.cameraMake, "Camera make:"],
                [photo.photoMetadata.cameraModel, "Camera model:"],
                [photo.description, "Description:"],
            ]
            void (photo.photoMetadata.gps && photo.photoMetadata.gps.latitude > 0 && items.push([String(photo.photoMetadata.gps.latitude), "Latitude:"]));
            void (photo.photoMetadata.gps && photo.photoMetadata.gps.longitude > 0 && items.push([String(photo.photoMetadata.gps.longitude), "Longitude:"]));
            void (photo.photoMetadata.gps && photo.photoMetadata.gps.altitude > 0 && items.push([String(photo.photoMetadata.gps.altitude), "Altitude:"]));

            const filteredItems = items.filter(item => (item[0] !== undefined && item[0] !== '')) || []
            return (
                <Box>
                    <Grid
                        container
                        spacing={0.5}
                        justifyContent="center"
                        alignItems="center"
                    >
                        {filteredItems.map((item, idx) => (
                            <Grid item xs={6} p={"1vw"} textAlign={idx % 2 == 0 ? "end" : "start"}>
                                <Typography>
                                    <Typography component="span" sx={{textDecoration: "underline", fontWeight: "bold"}}>
                                        {item[1]}
                                    </Typography>
                                    <Typography pl={"1vw"} component="span">
                                        {item[0]}
                                    </Typography>
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )
        } else if (photo) {
            return (
                <Box>
                    {photo.name && <Typography>Name: {photo.name}</Typography>}
                    {photo.description && <Typography>Description: {photo.description}</Typography>}
                </Box>
            );
        } else {
            return (
                <>
                </>
            );
        }
    }

    return (
        <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{position: "relative"}}>
                {originalBlob ? `${photo?.name}` : "Loading..."}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{position: "absolute", right: 8, top: 8}}
                >
                    <Close/>
                </IconButton>
                <IconButton
                    aria-label="zoom in"
                    onClick={() => {
                        showBlobRef.current?.zoomIn();
                        setZoomAmount(prevState => prevState < 5 ? (prevState + 1) : prevState);
                    }}
                    disabled={zoomAmount === 5}
                    sx={{position: "absolute", right: 100, top: 8}}
                >
                    <ZoomIn/>
                </IconButton>
                <IconButton
                    aria-label="zoom out"
                    onClick={() => {
                        showBlobRef.current?.zoomOut();
                        setZoomAmount(prevState => prevState > 0 ? (prevState - 1) : prevState)
                    }}
                    disabled={zoomAmount === 0}
                    sx={{position: "absolute", right: 150, top: 8}}
                >
                    <ZoomOut/>
                </IconButton>
                <IconButton
                    aria-label="download"
                    onClick={handleDownload}
                    sx={{position: "absolute", right: 200, top: 8}}
                >
                    <FileDownload/>
                </IconButton>
            </DialogTitle>
            <DialogContent
                ref={containerRef}
                dividers
                sx={{
                    p: 0,
                    height: "calc(100vh - 150px)",
                    overflow: "auto",
                    position: "relative",
                    justifyItems: "center",
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                {resizedBlob ? (
                    <>
                        {
                            getTopInformation()
                        }
                        <ShowBlob
                            ref={showBlobRef}
                            blob={resizedBlob}
                            label="Loading photo..."
                            altText={`Preview of photo ${photoId}`}
                            mode={"photo"}
                        />
                    </>
                ) : (
                    <Typography>Loading...</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ShowPhotoModal;

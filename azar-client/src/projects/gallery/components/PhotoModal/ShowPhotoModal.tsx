import React, {useEffect, useRef, useState} from "react";
import {Dialog, DialogContent, DialogTitle, IconButton, Typography,} from "@mui/material";
import {Close, FileDownload, ZoomIn, ZoomOut} from "@mui/icons-material";
import ShowBlob, {ShowBlobHandle} from "../../../shared/components/ShowBlob.tsx";
import {getPhotoWithPhoto} from "../../server/api/photoApi.ts";
import {base64ToBytes, detectContentType, resizeImageBlob,} from "../../../shared/utils/utilities.ts";
import {Photo} from "../../models/models.ts";
import getBottomInformation from "./GetBottomInformation.tsx";

interface ShowPhotoModalProps {
    photoId: string;
    onClose: () => void;
    cityCountry?: string | undefined;
}

const ShowPhotoModal: React.FC<ShowPhotoModalProps> = ({photoId, onClose, cityCountry}) => {
    const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);
    const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
    const [photo, setPhoto] = useState<Photo | null>(null);
    const [zoom, setZoom] = useState<number>(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
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

    const handleImageClick = (e: React.MouseEvent) => {
        if (!showBlobRef.current) return;
        const clickX = e.nativeEvent.offsetX;
        const clickY = e.nativeEvent.offsetY;
        if (showBlobRef.current.getCurrentZoom() < 3) {
            showBlobRef.current.zoomIn({x: clickX, y: clickY});
        } else if (showBlobRef.current.getCurrentZoom() > 1) {
            showBlobRef.current.zoomOut({x: clickX, y: clickY});
        }
        setZoom(showBlobRef.current.getCurrentZoom());
    };

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
                .catch((err) =>
                    console.error("Error resizing image blob:", err)
                );
        }
    }, [originalBlob, containerSize]);

    useEffect(() => {
        async function fetchPhoto() {
            return await getPhotoWithPhoto(photoId);
        }

        fetchPhoto().then((value) => {

            const byteArray = base64ToBytes(value.data);
            setOriginalBlob(new Blob([byteArray], {type: detectContentType(value.name)}));
            setPhoto(value);
        });
    }, [photoId]);

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
                        if (showBlobRef.current) {
                            showBlobRef.current.zoomIn();
                            setZoom(showBlobRef.current.getCurrentZoom());
                        }
                    }}
                    disabled={zoom === 3}
                    sx={{position: "absolute", right: 100, top: 8}}
                >
                    <ZoomIn/>
                </IconButton>
                <IconButton
                    aria-label="zoom out"
                    onClick={() => {
                        if (showBlobRef.current) {
                            showBlobRef.current.zoomOut();
                            setZoom(showBlobRef.current.getCurrentZoom());
                        }
                    }}
                    disabled={zoom === 1}
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
                    alignContent: "start",
                }}
            >
                {resizedBlob ? (
                    <>
                        <ShowBlob
                            ref={showBlobRef}
                            blob={resizedBlob}
                            label="Loading photo..."
                            altText={`Preview of photo ${photoId}`}
                            mode={"photo"}
                            onImageClick={handleImageClick}
                        />
                        {getBottomInformation(photo, cityCountry)}
                    </>
                ) : (
                    <Typography>Loading...</Typography>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ShowPhotoModal;

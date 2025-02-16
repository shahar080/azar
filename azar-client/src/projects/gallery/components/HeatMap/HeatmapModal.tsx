import React, {useEffect, useState} from "react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import HeatmapMap from "./HeatmapMap";
import {Photo} from "../../models/models.ts";
import {getPhotos} from "../../server/api/heatmapApi.ts";
import {Close} from "@mui/icons-material";
import PhotoGallery from "../Gallery/PhotoGallery.tsx";

interface HeatmapModalProps {
    photosId: string[];
    onClose: () => void;
}

const HeatmapModal: React.FC<HeatmapModalProps> = ({photosId, onClose}) => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [gpsPhotos, setGpsPhotos] = useState<Photo[]>([]);
    const [heatmapPoints, setHeatmapPoints] = useState<[number, number, number][]>([]);

    useEffect(() => {
        getPhotos()
            .then(value => {
                setPhotos(value)
            });
    }, [photosId]);

    useEffect(() => {
        setGpsPhotos(photos.filter((photo) =>
            photo.photoMetadata?.gps &&
            photo.photoMetadata.gps.latitude !== 0 &&
            photo.photoMetadata.gps.longitude !== 0
        ));
    }, [photos])

    useEffect(() => {
        setHeatmapPoints(gpsPhotos.map((photo) => {
                const {latitude, longitude} = photo.photoMetadata.gps;
                return [latitude, longitude, 8];
            }
        ))
    }, [gpsPhotos]);

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                Photos Heatmap
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{position: "absolute", right: 8, top: 8}}
                >
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent
                style={{
                    height: "70vw",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                <HeatmapMap points={heatmapPoints}/>
                <PhotoGallery viewMode={"modal"} gpsPhotos={gpsPhotos}/>
            </DialogContent>
        </Dialog>
    );
};

export default HeatmapModal;

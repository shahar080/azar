import React, {useEffect, useRef, useState} from "react";
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {getPhotosId} from "../server/api/photoApi.ts";
import ShowPhotoModal from "./ShowPhotoModal";
import PhotoCard from "./PhotoCard";

//TODO AZAR-134 Searchbar + Sort + Locations
const PhotoGallery: React.FC = () => {
    const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [photosId, setPhotosId] = useState<number[]>([]);
    const [visibleCount, setVisibleCount] = useState<number>(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isLarge = useMediaQuery(theme.breakpoints.up("lg"));

    const columns = isMobile ? 1 : isLarge ? 6 : 4;

    useEffect(() => {
        setVisibleCount(columns * 2);
    }, [columns]);

    const handleTouchStart = (photoId: number) => {
        if (isMobile) {
            longPressTimer.current = setTimeout(() => {
                setSelectedPhotoId(photoId);
            }, 600);
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleThumbnailClick = (photoId: number | null) => {
        if (photoId !== null) {
            setSelectedPhotoId(photoId);
        }
    };

    const fetchData = () => {
        setIsLoading(true);
        getPhotosId()
            .then((imagesIds) => {
                if (!imagesIds) {
                    throw new Error("No data received.");
                }
                setPhotosId(imagesIds);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
                setVisibleCount((prev) => Math.min(prev + columns * 2, photosId.length));
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [columns, photosId.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        if (container.scrollHeight <= container.clientHeight && visibleCount < photosId.length) {
            setVisibleCount((prev) => Math.min(prev + columns * 2, photosId.length));
        }
    }, [visibleCount, photosId.length, columns]);

    return (
        <>
            <Box
                ref={containerRef}
                sx={{
                    height: "calc(100vh - 250px)",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {width: "6px"},
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#b0b0b0",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                    paddingRight: 1,
                }}
            >
                <Grid container spacing={5} p={"1vw"} justifyContent={"center"}>
                    {isLoading ? (
                        <Typography mt={"3vw"} variant={"h6"} color="primary">
                            Loading photos...
                        </Typography>
                    ) : photosId.length === 0 ? (
                        <Typography mt={"3vw"} variant={"h6"} color="primary">
                            No photos available.
                        </Typography>
                    ) : (
                        photosId.slice(0, visibleCount).map((photoId) => (
                            <Grid item xs={10} sm={5} md={3} lg={2} key={photoId}>
                                <PhotoCard
                                    photoId={photoId}
                                    handleTouchStart={handleTouchStart}
                                    handleTouchEnd={handleTouchEnd}
                                    handleThumbnailClick={handleThumbnailClick}
                                />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>

            {selectedPhotoId && (
                <ShowPhotoModal photoId={selectedPhotoId} onClose={() => setSelectedPhotoId(null)}/>
            )}
        </>
    );
};

export default PhotoGallery;

import React, {useEffect, useRef, useState} from "react";
import {Box, Grid, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {getPhotosId} from "../../server/api/photoApi.ts";
import ShowPhotoModal from "../PhotoModal/ShowPhotoModal.tsx";
import PhotoCard from "../PhotoCard.tsx";
import GallerySearchBar from "./GallerySearchBar.tsx";
import {Photo} from "../../models/models.ts";
import {reverseGeocode} from "../../server/api/openStreetMapApi.ts";
import {formatAsDate} from "../../../cloud/components/sharedLogic.ts";

const PhotoGallery: React.FC = () => {
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [photosId, setPhotosId] = useState<string[]>([]);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [filteredPhotosId, setFilteredPhotosId] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState<number>(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
    const [cityCountries, setCityCountries] = useState<Set<string>>(new Set());
    const [cityCountryToIds, setCityCountryToIds] = useState<Map<string, string[]>>(new Map());
    const [idToCityCountry, setIdToCityCountry] = useState<Map<string, string>>(new Map());

    const columns = isMobile ? 1 : isLarge ? 6 : 4;

    const handleTouchStart = (photoId: string) => {
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

    const handleThumbnailClick = (photoId: string | null) => {
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
                setFilteredPhotosId(imagesIds);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => setIsLoading(false));
    };

    const onPhotoLoaded = (photo: Photo) => {
        setPhotos(prevState => [...prevState, photo]);
        if (photo.photoMetadata.gps) {
            if (photo.photoMetadata.gps.latitude && photo.photoMetadata.gps.latitude !== 0 &&
                photo.photoMetadata.gps.longitude && photo.photoMetadata.gps.longitude !== 0) {
                reverseGeocode(photo.photoMetadata.gps.latitude, photo.photoMetadata.gps.longitude)
                    .then(cityCountry => {
                        if (cityCountry === "") return;
                        setCityCountryToIds(prevState => {
                            const next = new Map(prevState);
                            const nextArr = next.get(cityCountry) || [];
                            next.set(cityCountry, [...nextArr, photo.id]);
                            return next;
                        });
                        setCityCountries(prevState => {
                            const next = new Set(prevState)
                            next.add(cityCountry);
                            return next
                        });
                        setIdToCityCountry(prevState => {
                            const next = new Map(prevState);
                            next.set(String(photo.id), cityCountry);
                            return next;
                        });
                    });
            }
        }
    }

    const handleSearch = (query: string, labels: string[]) => {
        if (query && labels) {
            const lowerQuery = query.toLowerCase();
            let textFilteredIds: string[] = [];
            if (query && query.length > 0) {
                textFilteredIds = photos.filter(photo =>
                    photo.name.toLowerCase().includes(lowerQuery) ||
                    photo.description.toLowerCase().includes(lowerQuery) ||
                    formatAsDate(photo.photoMetadata.dateTaken).toLowerCase().includes(lowerQuery)
                ).map(photo => photo.id);
            }

            const locationFilteredIds = labels.flatMap(label => cityCountryToIds.get(label) ?? []);
            const filteredIds = Array.from(new Set([...textFilteredIds, ...locationFilteredIds]));
            setFilteredPhotosId(filteredIds);
        } else {
            setFilteredPhotosId(photosId);
        }
    }

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

    useEffect(() => {
        setVisibleCount(columns * 2);
    }, [columns]);

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
                    justifyItems: "center"
                }}
            >
                <GallerySearchBar onSearch={handleSearch} cityCountries={cityCountries}/>
                <Grid container spacing={5} p={"1vw"} justifyContent={"center"}>
                    {isLoading ? (
                        <Typography mt={"3vw"} variant={"h6"} color="primary">
                            Loading photos...
                        </Typography>
                    ) : filteredPhotosId.length === 0 ? (
                        <Typography mt={"3vw"} variant={"h6"} color="primary">
                            No photos available.
                        </Typography>
                    ) : (
                        filteredPhotosId.slice(0, visibleCount).map((photoId) => (
                            <Grid item xs={10} sm={5} md={3} lg={2} key={photoId}>
                                <PhotoCard
                                    photoId={photoId}
                                    handleTouchStart={handleTouchStart}
                                    handleTouchEnd={handleTouchEnd}
                                    handleThumbnailClick={handleThumbnailClick}
                                    onPhotoLoaded={onPhotoLoaded}
                                    cityCountry={idToCityCountry.get(photoId)}
                                />
                            </Grid>
                        ))
                    )}
                </Grid>
            </Box>

            {selectedPhotoId && (
                <ShowPhotoModal
                    photoId={selectedPhotoId}
                    onClose={() => setSelectedPhotoId(null)}
                    cityCountry={idToCityCountry.get(String(selectedPhotoId))}
                />
            )}
        </>
    );
};

export default PhotoGallery;

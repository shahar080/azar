import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    useMediaQuery
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {
    deletePhoto,
    getLightweightPhoto,
    getPhotosId,
    refreshMetadata,
    updatePhoto,
    uploadPhoto
} from "../server/api/photoApi.ts";
import {useToast} from "../../shared/utils/toast/useToast";
import {formatAsDateAndTime, handleRequestSort, sortData} from "../../cloud/components/sharedLogic.ts";
import {Photo} from "../models/models.ts";
import GalleryContextMenu from "./Gallery/GalleryContextMenu.tsx";
import ShowPhotoModal from "./PhotoModal/ShowPhotoModal.tsx";
import {getUserName} from "../../shared/utils/AppState.ts";
import EditPhotoModal from "./PhotoModal/EditPhotoModal.tsx";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";

const PhotoList: React.FC = () => {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [photosId, setPhotosId] = useState<string[]>([]);
    const [visibleCount, setVisibleCount] = useState<number>(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isLarge = useMediaQuery(theme.breakpoints.up("lg"));
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [orderBy, setOrderBy] = useState<string>('fileName');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [sortedPhotos, setSortedPhotos] = useState<Photo[]>([]);
    const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
    const [editPhotoModal, setEditPhotoModal] = useState<boolean>(false);
    const userName = getUserName();
    const {showToast} = useToast();
    const {setLoadingAnimation} = useLoading();
    const columns = isMobile ? 1 : isLarge ? 6 : 4;

    const handleTouchStart = (photo: Photo) => {
        if (isMobile) {
            longPressTimer.current = setTimeout(() => {
                setSelectedPhoto(photo);
            }, 600);
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleRightClick = (event: MouseEvent<HTMLTableRowElement>, photo: Photo) => {
        if (!isMobile) {
            event.preventDefault();
            setAnchorPosition({top: event.clientY - 4, left: event.clientX - 2});
            setSelectedPhoto(photo);
        }
    };

    const handleCloseMenu = () => {
        setAnchorPosition(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsLoading(true);
            const file = e.target.files[0];
            uploadPhoto(file)
                .then((newPhoto) => {
                    if (newPhoto !== undefined) {
                        setPhotos(prevState => [...prevState, newPhoto]);
                        showToast("Successfully uploaded photo \"" + newPhoto.name + "\"", "success");
                    } else {
                        showToast("Error uploading photo \"" + file.name + "\"", "error");
                    }
                })
                .catch((error) => {
                    console.error("Upload error:", error);
                    showToast("Error uploading photo \"" + file.name + "\"", "error");
                })
                .finally(() => setIsLoading(false));
        }
    };

    const handleDeletePhoto = (photoToRemove: Photo) => {
        if (userName === null) {
            showToast("Error deleting Photo \"" + photoToRemove.id + "\"", "error");
            return;
        }
        setIsLoading(true);
        deletePhoto(photoToRemove.id, {currentUser: userName})
            .then((res) => {
                if (res === 200) {
                    setPhotos(photos.filter((photo) => photo !== photoToRemove));
                    showToast("Photo \"" + photoToRemove.name + "\" deleted successfully.", "success");
                } else if (res === 401) {
                    showToast("Current user can't delete Photo \"" + photoToRemove.name + "\"", "error");
                } else {
                    showToast("Error deleting Photo \"" + photoToRemove.name + "\"", "error");
                }
            })
            .catch(() => {
                showToast("Error deleting Photo \"" + photoToRemove.name + "\"", "error");
            })
            .finally(() => setIsLoading(false));
        handleCloseMenu();
    }

    const handleRefreshMetadata = (photoToRefreshMetadata: Photo) => {
        if (userName === null) {
            showToast("Error refreshing metadata for Photo \"" + photoToRefreshMetadata.id + "\"", "error");
            return;
        }
        setIsLoading(true);
        refreshMetadata(photoToRefreshMetadata.id, {currentUser: userName})
            .then((res) => {
                if (res) {
                    showToast("Photo \"" + photoToRefreshMetadata.name + "\" metadata refreshed successfully.", "success");
                } else {
                    showToast("Error refreshing metadata for Photo \"" + photoToRefreshMetadata.name + "\"", "error");
                }
            })
            .catch(() => {
                showToast("Error refreshing metadata for Photo \"" + photoToRefreshMetadata.name + "\"", "error");
            })
            .finally(() => setIsLoading(false));
        handleCloseMenu();
    }

    const handleSaveEdit = (updatedPhoto: Photo) => {
        setIsLoading(true);
        updatePhoto({currentUser: userName, photo: updatedPhoto})
            .then((res) => {
                if (res && res.id === updatedPhoto.id) {
                    setSelectedPhoto(res);
                    const updatedPhotos = photos.map((photo) => (photo.id === updatedPhoto.id ? updatedPhoto : photo));
                    setPhotos(updatedPhotos);
                    showToast("Photo \"" + res.name + "\" updated successfully.", "success");
                } else {
                    showToast("Error updating photo \"" + updatedPhoto.name + "\"", "error");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const fetchData = () => {
        setIsLoading(true);
        getPhotosId()
            .then((imagesIds) => {
                setPhotosId(imagesIds);
                imagesIds.forEach((imageId) => {
                    getLightweightPhoto(imageId)
                        .then(value => setPhotos(prevState => [...prevState, value]));
                })
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
        setVisibleCount(columns * 2);
    }, [columns]);

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
        setSortedPhotos(sortData([...photos], order, orderBy, true));
    }, [order, orderBy, photos]);

    useEffect(() => {
        setLoadingAnimation(isLoading);
    }, [isLoading, setLoadingAnimation]);

    return (
        <>
            <Box>
                <Button variant="outlined" component="label" color="secondary">
                    Upload Photo
                    <input type="file" hidden onChange={handleFileUpload} accept="image/jpeg"/>
                </Button>
            </Box>
            <TableContainer
                ref={containerRef}
                component={Paper}
                sx={{
                    height: "100%",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {width: "6px"},
                    "&::-webkit-scrollbar-thumb": {backgroundColor: "#b0b0b0", borderRadius: "10px"},
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {['id', 'size', 'name', 'description', 'dateTaken', 'uploadedAt'].map((field) => (
                                <TableCell key={field} sortDirection={orderBy === field ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === field}
                                        direction={orderBy === field ? order : 'asc'}
                                        onClick={() => handleRequestSort(field, orderBy, order, setOrder, setOrderBy)}
                                    >
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPhotos.map((photo: Photo) => (
                            <TableRow
                                key={photo.id}
                                hover
                                onClick={(e) => handleRightClick(e, photo)}
                                onContextMenu={(e) => handleRightClick(e, photo)}
                                onTouchStart={() => handleTouchStart(photo)}
                                onTouchEnd={handleTouchEnd}
                                sx={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                    WebkitTouchCallout: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                }}
                            >
                                <TableCell>{photo.id}</TableCell>
                                <TableCell>{photo.size}</TableCell>
                                <TableCell>{photo.name}</TableCell>
                                <TableCell>{photo.description}</TableCell>
                                <TableCell>{formatAsDateAndTime(photo.photoMetadata.dateTaken)}</TableCell>
                                <TableCell>{formatAsDateAndTime(photo.uploadedAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <GalleryContextMenu
                anchorPosition={anchorPosition}
                photo={selectedPhoto}
                onClose={handleCloseMenu}
                onOpen={() => {
                    handleCloseMenu();
                    setShowPhotoModal(true);
                }}
                onEdit={() => {
                    handleCloseMenu();
                    setEditPhotoModal(true);
                }}
                onDelete={(photoToRemove) => handleDeletePhoto(photoToRemove)}
                onRefreshMetadata={handleRefreshMetadata}
            />

            {selectedPhoto && showPhotoModal && (
                <ShowPhotoModal
                    photoId={selectedPhoto.id}
                    onClose={() => {
                        setSelectedPhoto(null);
                        setShowPhotoModal(false);
                    }}/>
            )}

            {selectedPhoto && editPhotoModal && (
                <EditPhotoModal
                    open={editPhotoModal}
                    photo={selectedPhoto}
                    onClose={() => {
                        setSelectedPhoto(null);
                        setEditPhotoModal(false);
                    }}
                    onSave={handleSaveEdit}
                />
            )}
        </>
    );
};

export default PhotoList;

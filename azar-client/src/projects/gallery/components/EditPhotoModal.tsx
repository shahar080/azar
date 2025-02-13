import {Photo} from "../models/models.ts";
import React, {useState} from "react";
import {Box, Button, Modal, Stack, TextField, Typography} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import {Description, Notes, Place, Terrain} from "@mui/icons-material";
import {getFileExtension} from "../../cloud/components/sharedLogic.ts";

interface EditPhotoModalProps {
    open: boolean;
    photo: Photo;
    onClose: () => void;
    onSave: (updatedPhoto: Photo) => void
}

const EditPhotoModal: React.FC<EditPhotoModalProps> = ({open, photo, onClose, onSave}) => {
    const [name, setName] = useState<string>(photo.name);
    const [description, setDescription] = useState<string>(photo.description);
    const [latitude, setLatitude] = useState<number | undefined>(photo.photoMetadata.gps?.latitude);
    const [longitude, setLongitude] = useState<number | undefined>(photo.photoMetadata.gps?.longitude);
    const [altitude, setAltitude] = useState<number | undefined>(photo.photoMetadata.gps?.altitude);

    const handleSave = () => {
        const photoMetadata = photo.photoMetadata;
        const gps = photoMetadata.gps;
        void (latitude !== undefined && (gps.latitude = latitude));
        void (longitude !== undefined && (gps.longitude = longitude));
        void (altitude !== undefined && (gps.altitude = altitude));
        photoMetadata.gps = gps;
        onSave({
            ...photo,
            name,
            description,
            photoMetadata,
        });
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Edit Photo Data
                </Typography>

                <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => {
                        const fileExtension = getFileExtension(photo.name);
                        if (!name.endsWith(`.${fileExtension}`)) {
                            const baseName = name.replace(/\.[^/.]+$/, '');
                            setName(`${baseName}.${fileExtension}`);
                        }
                    }}
                    margin="dense"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Description/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="dense"
                    multiline
                    rows={3}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Notes/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Latitude"
                    type={"number"}
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value === "" ? undefined : Number(e.target.value))}
                    margin="dense"
                    rows={3}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Place/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Longitude"
                    type={"number"}
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value === "" ? undefined : Number(e.target.value))}
                    margin="dense"
                    rows={3}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Place/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Altitude"
                    type={"number"}
                    value={altitude}
                    onChange={(e) => setAltitude(e.target.value === "" ? undefined : Number(e.target.value))}
                    margin="dense"
                    rows={3}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Terrain/>
                            </InputAdornment>
                        ),
                    }}
                />

                <Stack direction="row" spacing={2} mt={2}>
                    <Button variant="outlined" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}
export default EditPhotoModal;
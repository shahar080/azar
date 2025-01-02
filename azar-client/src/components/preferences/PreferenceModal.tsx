import React, {useEffect, useState} from "react";
import {Box, Button, Modal, Stack, TextField, Typography} from "@mui/material";
import {Preference} from "../../models/models.ts";
import InputAdornment from "@mui/material/InputAdornment";
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TextFieldsIcon from '@mui/icons-material/TextFields';

interface PreferenceModalProps {
    open: boolean;
    preference: Preference | null;
    onClose: () => void;
    onSave?: (updatedPreference: Preference) => void;
    mode: "view" | "edit";
}

const PreferenceModal: React.FC<PreferenceModalProps> = ({open, preference, onClose, onSave, mode}) => {
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");

    useEffect(() => {
        if (preference) {
            setKey(preference.key || "");
            setValue(preference.value || "");
        }
    }, [preference]);

    const handleSave = () => {
        if (onSave && preference) {
            onSave({
                ...preference,
                key: key,
                value: value,
            });
            onClose();
        }
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
                    {mode === "view" ? "View Preference" : "Edit Preference"}
                </Typography>

                <TextField
                    fullWidth
                    label="Key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    margin="dense"
                    disabled={mode === "view"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <VpnKeyIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    margin="dense"
                    disabled={mode === "view"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <TextFieldsIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Actions */}
                <Stack direction="row" spacing={2} mt={2}>
                    {mode === "edit" && (
                        <Button variant="outlined" onClick={handleSave}>
                            Save
                        </Button>
                    )}
                    <Button variant="outlined" onClick={onClose}>
                        {mode === "view" ? "Close" : "Cancel"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default PreferenceModal;

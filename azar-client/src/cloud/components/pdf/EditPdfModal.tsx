import React, {useEffect, useState} from "react";
import {Autocomplete, Box, Button, Modal, Stack, TextField, Typography,} from "@mui/material";
import {PdfFile} from "../../models/models.ts";
import CustomLabel from "../label/CustomLabel.tsx";
import InputAdornment from "@mui/material/InputAdornment";
import {Description, Notes} from "@mui/icons-material";

interface EditPdfModalProps {
    open: boolean;
    pdf: PdfFile | null;
    onClose: () => void;
    onSave: (updatedPdf: PdfFile) => void;
    allLabels: string[];
}

const EditPdfModal: React.FC<EditPdfModalProps> = ({
                                                       open,
                                                       pdf,
                                                       onClose,
                                                       onSave,
                                                       allLabels
                                                   }) => {
    const [fileName, setFileName] = useState("");
    const [labels, setLabels] = useState<string[]>([]);
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (pdf) {
            setFileName(pdf.fileName || "");
            setLabels(pdf.labels || []);
            setDescription(pdf.description || "");
        }
    }, [pdf]);

    const handleRemoveLabel = (labelToRemove: string) => {
        setLabels(labels.filter((label) => label !== labelToRemove));
    };

    const handleSave = () => {
        if (pdf) {
            onSave({
                ...pdf,
                fileName,
                labels,
                description,
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
                    Edit PDF
                </Typography>

                <TextField
                    fullWidth
                    label="Name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onBlur={() => {
                        if (!fileName.endsWith('.pdf')) {
                            const baseName = fileName.replace(/\.[^/.]+$/, '');
                            setFileName(`${baseName}.pdf`);
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

                <Autocomplete
                    multiple
                    freeSolo
                    options={allLabels.filter((option) => !labels.includes(option))}
                    value={labels}
                    onChange={(_event, newValue) => setLabels(newValue)}
                    renderTags={(value, getTagProps) =>
                        value.map((label, index) => (
                            <CustomLabel
                                label={label}
                                onRemove={() => handleRemoveLabel(label)}
                                {...getTagProps({index})}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Labels"
                            margin="dense"
                            inputProps={{
                                ...params.inputProps,
                                inputMode: 'text',
                                type: 'text',
                                enterKeyHint: 'done',
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && (event.target as HTMLInputElement).value) {
                                    event.preventDefault();
                                    const inputValue = (event.target as HTMLInputElement).value.trim();
                                    if (inputValue && !labels.includes(inputValue)) {
                                        setLabels([...labels, inputValue]);
                                    }
                                    (event.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                    )}
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
};

export default EditPdfModal;

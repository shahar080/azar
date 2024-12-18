import React, {useEffect, useState} from "react";
import {Box, Button, Modal, Stack, TextField, Typography,} from "@mui/material";
import {PdfFile} from "../models/models";

interface EditPdfModalProps {
    open: boolean;
    pdf: PdfFile | null;
    onClose: () => void;
    onSave: (updatedPdf: PdfFile) => void;
}

const EditPdfModal: React.FC<EditPdfModalProps> = ({open, pdf, onClose, onSave}) => {
    const [fileName, setFileName] = useState("");
    const [labels, setLabels] = useState<string[]>([]);
    const [description, setDescription] = useState("");

    // Load PDF data when modal opens or the PDF changes
    useEffect(() => {
        if (pdf) {
            setFileName(pdf.fileName || "");
            setLabels(pdf.labels || []);
            setDescription(pdf.description || "");
        }
    }, [pdf]);

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
                <Typography variant="h6" mb={2}>Edit PDF</Typography>
                <TextField
                    fullWidth
                    label="Name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    margin="dense"
                />
                <TextField
                    fullWidth
                    label="Labels (comma-separated)"
                    value={labels.join(", ")}
                    onChange={(e) =>
                        setLabels(e.target.value.split(",").map((label) => label.trim()))
                    }
                    margin="dense"
                />
                <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="dense"
                    multiline
                    rows={3}
                />
                <Stack direction="row" spacing={2} mt={2}>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                    <Button variant="outlined" onClick={onClose}>Cancel</Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default EditPdfModal;

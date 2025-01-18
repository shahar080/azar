import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {PdfFile} from "../../models/models.ts";
import ShowPDF from "./ShowPDF.tsx";
import React from "react";

interface ShowPDFModalProps {
    open: boolean;
    pdfFile: PdfFile | null;
    onClose: () => void;
}

const ShowPDFModal: React.FC<ShowPDFModalProps> = ({open, pdfFile, onClose}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {pdfFile?.fileName}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{position: "absolute", right: 8, top: 8}}
                >
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {pdfFile && (
                    <ShowPDF
                        pdfId={pdfFile.id.toString()}
                        altText={`Preview of ${pdfFile.fileName}`}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ShowPDFModal;

import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {PdfFile} from "../../models/models.ts";
import PdfPreview from "./PdfPreview.tsx";

interface PdfPreviewModalProps {
    open: boolean;
    pdfFile: PdfFile | null;
    onClose: () => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({open, pdfFile, onClose}) => {
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
                    <PdfPreview
                        pdfId={pdfFile.id.toString()}
                        altText={`Preview of ${pdfFile.fileName}`}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PdfPreviewModal;

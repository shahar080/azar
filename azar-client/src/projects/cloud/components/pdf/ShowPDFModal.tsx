import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Close} from "@mui/icons-material";
import {PdfFile} from "../../models/models.ts";
import ShowBlob from "../../../shared/components/ShowBlob.tsx";
import React, {useEffect, useState} from "react";
import {fetchPDF} from "../../server/api/pdfFileApi.ts";
import {getUserName} from "../../../shared/utils/AppState.ts";

interface ShowPDFModalProps {
    open: boolean;
    pdfFile: PdfFile | null;
    onClose: () => void;
}

const ShowPDFModal: React.FC<ShowPDFModalProps> = ({open, pdfFile, onClose}) => {
    const [blob, setBlob] = useState<Blob | null>(null);

    useEffect(() => {
        const userName = getUserName();
        const fetchData = async () => {
            let blob = null;
            if (pdfFile) {
                blob = await fetchPDF({currentUser: userName}, pdfFile.id.toString());
            }
            return blob;
        };
        fetchData()
            .then(value => setBlob(value));
    }, [pdfFile]);

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
                {pdfFile && blob && (
                    <ShowBlob
                        blob={blob}
                        label={"Loading PDF.."}
                        altText={`Preview of ${pdfFile.fileName}`}
                        mode={"pdf"}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ShowPDFModal;

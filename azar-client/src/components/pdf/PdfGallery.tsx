import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Box, Card, CardActionArea, CardContent, Grid, Typography} from "@mui/material";
import {PdfFile} from "../../models/models.ts";
import PdfPreviewModal from "./PdfPreviewModal.tsx";
import PdfThumbnail from "./PdfThumbnail.tsx";
import PdfContextMenu from "./PdfContextMenu.tsx";

interface PdfGalleryProps {
    pdfs: PdfFile[];
    onLoadMore: () => void;
    onRowClick: (pdf: PdfFile) => void;
    onEdit: (pdf: PdfFile) => void;
    onDelete: (pdfId: string) => void;
}

const PdfGallery: React.FC<PdfGalleryProps> = ({pdfs, onLoadMore, onRowClick, onEdit, onDelete}) => {
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const handleRightClick = (event: MouseEvent<HTMLDivElement>, pdf: PdfFile) => {
        event.preventDefault();
        setAnchorPosition({top: event.clientY - 4, left: event.clientX - 4});
        setSelectedPdf(pdf);
    };

    const handleCloseMenu = () => {
        setAnchorPosition(null);
    };

    const handleThumbnailClick = (pdf: PdfFile) => {
        setSelectedPdf(pdf);
        setPreviewOpen(true);
    };

    const handleOnViewMore = (pdf: PdfFile) => {
        onRowClick(pdf);
        handleCloseMenu();
    }

    const handleDelete = () => {
        if (selectedPdf) {
            onDelete(selectedPdf.id);
        }
        handleCloseMenu();
    };

    const handleEdit = () => {
        if (selectedPdf) {
            onEdit(selectedPdf);
        }
        handleCloseMenu();
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (container) {
            const bottomReached =
                Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight;

            if (bottomReached) {
                onLoadMore();
            }
        }
    };

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (container) container.removeEventListener("scroll", handleScroll);
        };
    }, [onLoadMore]);

    return (
        <>
            {/* Scrollable Container */}
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
                <Grid container spacing={2}>
                    {pdfs.map((pdf) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={pdf.id}>
                            <Card
                                onContextMenu={(e) => handleRightClick(e, pdf)}
                                style={{cursor: "context-menu"}}
                            >
                                <CardActionArea onClick={() => handleThumbnailClick(pdf)}>
                                    <PdfThumbnail pdfId={pdf.id} altText={pdf.fileName}/>
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            {pdf.fileName}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Context Menu */}
            <PdfContextMenu
                anchorPosition={anchorPosition}
                pdfFile={selectedPdf}
                onClose={handleCloseMenu}
                onViewMore={handleOnViewMore}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* PDF Preview Modal */}
            <PdfPreviewModal
                open={isPreviewOpen}
                pdfFile={selectedPdf}
                onClose={() => setPreviewOpen(false)}
            />
        </>
    );
};

export default PdfGallery;

import React, {MouseEvent, TouchEvent, useEffect, useRef, useState} from "react";
import {Box, Card, CardActionArea, CardContent, Grid, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {PdfFile} from "../../models/models.ts";
import ShowPDFModal from "./ShowPDFModal.tsx";
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
    const [isShowPDF, setShowPDF] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Context Menu Handlers
    const handleRightClick = (event: MouseEvent<HTMLDivElement>, pdf: PdfFile) => {
        if (!isMobile) {
            event.preventDefault();
            setAnchorPosition({top: event.clientY - 4, left: event.clientX - 4});
            setSelectedPdf(pdf);
        }
    };

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>, pdf: PdfFile) => {
        if (isMobile) {
            longPressTimer.current = setTimeout(() => {
                setAnchorPosition({
                    top: event.touches[0].clientY,
                    left: event.touches[0].clientX,
                });
                setSelectedPdf(pdf);
            }, 600); // Long press duration
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleCloseMenu = () => {
        setAnchorPosition(null);
    };

    const handleThumbnailClick = (pdf: PdfFile) => {
        setSelectedPdf(pdf);
        setShowPDF(true);
    };

    const handleOnViewMore = (pdf: PdfFile) => {
        onRowClick(pdf);
        handleCloseMenu();
    };

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
                                onTouchStart={(e) => handleTouchStart(e, pdf)}
                                onTouchEnd={handleTouchEnd}
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

            {/* Show PDF Modal */}
            <ShowPDFModal
                open={isShowPDF}
                pdfFile={selectedPdf}
                onClose={() => setShowPDF(false)}
            />
        </>
    );
};

export default PdfGallery;

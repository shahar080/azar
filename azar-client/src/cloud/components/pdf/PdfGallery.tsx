import React, {MouseEvent, TouchEvent, useEffect, useRef, useState} from "react";
import {Box, Card, CardActionArea, CardContent, Grid, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {PdfFile} from "../../models/models.ts";
import ShowPDFModal from "./ShowPDFModal.tsx";
import PdfThumbnail from "./PdfThumbnail.tsx";
import PdfContextMenu from "./PdfContextMenu.tsx";
import {downloadPdf} from "../../utils/utilities.ts";

interface PdfGalleryProps {
    pdfs: PdfFile[];
    onLoadMore: () => void;
    onRowClick: (pdf: PdfFile) => void;
    onEdit: (pdf: PdfFile) => void;
    onDelete: (pdf: PdfFile) => void;
}

const PdfGallery: React.FC<PdfGalleryProps> = ({pdfs, onLoadMore, onRowClick, onEdit, onDelete}) => {
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
    const [isShowPDF, setShowPDF] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
            }, 600);
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
            onDelete(selectedPdf);
        }
        handleCloseMenu();
    };

    const handleEdit = () => {
        if (selectedPdf) {
            onEdit(selectedPdf);
        }
        handleCloseMenu();
    };

    useEffect(() => {
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
                                sx={{
                                    cursor: "context-menu",
                                    userSelect: "none",
                                    WebkitTouchCallout: "none",
                                    WebkitUserSelect: "none",
                                }}
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

            <PdfContextMenu
                anchorPosition={anchorPosition}
                pdfFile={selectedPdf}
                onClose={handleCloseMenu}
                onViewMore={handleOnViewMore}
                onDownloadPdf={downloadPdf}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ShowPDFModal
                open={isShowPDF}
                pdfFile={selectedPdf}
                onClose={() => setShowPDF(false)}
            />
        </>
    );
};

export default PdfGallery;

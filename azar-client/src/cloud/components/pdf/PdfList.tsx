import React, {MouseEvent, TouchEvent, useEffect, useRef, useState} from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    useMediaQuery,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {PdfFile} from "../../models/models.ts";
import PdfContextMenu from "./PdfContextMenu.tsx";
import ShowPDFModal from "./ShowPDFModal.tsx";
import {downloadPdf, formatDate} from "../../utils/utilities.ts";
import {handleRequestSort, sortData} from "../sharedLogic.ts";

interface PdfListProps {
    pdfs: PdfFile[];
    onRowClick: (pdf: PdfFile) => void;
    onLoadMore: () => void;
    onDelete: (pdf: PdfFile) => void;
    onEdit: (pdf: PdfFile) => void;
}

const PdfList: React.FC<PdfListProps> = ({pdfs, onRowClick, onLoadMore, onDelete, onEdit}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
    const [isShowPDF, setShowPDF] = useState(false);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('fileName');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (container) {
                const bottomReached =
                    container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
                if (bottomReached) {
                    onLoadMore();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => container?.removeEventListener("scroll", handleScroll);
    }, [onLoadMore]);

    const sortedPdfs = sortData([...pdfs], order, orderBy, true);

    const handleRightClick = (event: MouseEvent<HTMLTableRowElement>, pdf: PdfFile) => {
        if (!isMobile) {
            event.preventDefault();
            setAnchorPosition({top: event.clientY - 4, left: event.clientX - 2});
            setSelectedPdf(pdf);
        }
    };

    const handleTouchStart = (event: TouchEvent<HTMLTableRowElement>, pdf: PdfFile) => {
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

    const handleShowPDF = () => {
        if (selectedPdf) {
            setShowPDF(true);
        }
        handleCloseMenu();
    };

    return (
        <>
            <TableContainer
                ref={containerRef}
                component={Paper}
                sx={{
                    height: "calc(100vh - 250px)",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {width: "6px"},
                    "&::-webkit-scrollbar-thumb": {backgroundColor: "#b0b0b0", borderRadius: "10px"},
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {['fileName', 'size', 'upload date', 'labels', 'description', 'uploaded by'].map((field) => (
                                <TableCell key={field} sortDirection={orderBy === field ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === field}
                                        direction={orderBy === field ? order : 'asc'}
                                        onClick={() => handleRequestSort(field, orderBy, order, setOrder, setOrderBy)}
                                    >
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPdfs.map((pdf: PdfFile) => (
                            <TableRow
                                key={pdf.id}
                                hover
                                onClick={() => onRowClick(pdf)}
                                onContextMenu={(e) => handleRightClick(e, pdf)}
                                onTouchStart={(e) => handleTouchStart(e, pdf)}
                                onTouchEnd={handleTouchEnd}
                                sx={{
                                    cursor: "pointer",
                                    userSelect: "none",
                                    WebkitTouchCallout: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                }}
                            >
                                <TableCell>{pdf.fileName}</TableCell>
                                <TableCell>{pdf.size}</TableCell>
                                <TableCell>{formatDate(pdf.uploadedAt)}</TableCell>
                                <TableCell>{pdf.labels?.join(", ") || "No labels available"}</TableCell>
                                <TableCell>{pdf.description || "No description available"}</TableCell>
                                <TableCell>{pdf.uploadedBy}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <PdfContextMenu
                anchorPosition={anchorPosition}
                pdfFile={selectedPdf}
                onClose={handleCloseMenu}
                onViewMore={handleOnViewMore}
                onDownloadPdf={downloadPdf}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowPDF={handleShowPDF}
            />
            <ShowPDFModal
                open={isShowPDF}
                pdfFile={selectedPdf}
                onClose={() => setShowPDF(false)}
            />
        </>
    );
};

export default PdfList;

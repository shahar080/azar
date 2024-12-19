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
import {formatDate, parseSize} from "../../utils/utilities.ts";

interface PdfListProps {
    pdfs: PdfFile[];
    onRowClick: (pdf: PdfFile) => void;
    onLoadMore: () => void;
    onDelete: (pdfId: string) => void;
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

    // Sorting Logic
    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortData = (array: any[]) => {
        return array.sort((a, b) => {
            const isAsc = order === 'asc';
            if (orderBy === 'size') {
                const sizeA = parseSize(a.size);
                const sizeB = parseSize(b.size);
                return isAsc ? sizeA - sizeB : sizeB - sizeA;
            }
            if (a[orderBy] < b[orderBy]) {
                return isAsc ? -1 : 1;
            }
            if (a[orderBy] > b[orderBy]) {
                return isAsc ? 1 : -1;
            }
            return 0;
        });
    };

    const sortedPdfs = sortData([...pdfs]);

    // Context Menu Logic
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
            }, 600); // Long-press duration
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
                            {['fileName', 'size', 'uploadedAt', 'labels', 'description'].map((field) => (
                                <TableCell key={field} sortDirection={orderBy === field ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === field}
                                        direction={orderBy === field ? order : 'asc'}
                                        onClick={() => handleRequestSort(field)}
                                    >
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPdfs.map((pdf) => (
                            <TableRow
                                key={pdf.id}
                                hover
                                onClick={() => onRowClick(pdf)}
                                onContextMenu={(e) => handleRightClick(e, pdf)}
                                onTouchStart={(e) => handleTouchStart(e, pdf)}
                                onTouchEnd={handleTouchEnd}
                                sx={{
                                    cursor: "pointer",
                                    userSelect: "none",              // Prevents text selection
                                    WebkitTouchCallout: "none",     // Disables iOS native menu
                                    WebkitUserSelect: "none",       // Prevents Safari text selection
                                    MozUserSelect: "none",          // Prevents Firefox text selection
                                    msUserSelect: "none",           // Prevents IE/Edge text selection
                                }}
                            >
                                <TableCell>{pdf.fileName}</TableCell>
                                <TableCell>{pdf.size}</TableCell>
                                <TableCell>{formatDate(pdf.uploadedAt)}</TableCell>
                                <TableCell>{pdf.labels?.join(", ") || "No labels available"}</TableCell>
                                <TableCell>{pdf.description || "No description available"}</TableCell>
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

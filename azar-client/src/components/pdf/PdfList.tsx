import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel} from "@mui/material";
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
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
    const [isShowPDF, setShowPDF] = useState(false);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('fileName');

    // Infinite Scroll Logic
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

    // Sort function
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

    // Right-click logic
    const handleRightClick = (event: MouseEvent<HTMLTableRowElement>, pdf: PdfFile) => {
        event.preventDefault();
        setAnchorPosition({top: event.clientY - 4, left: event.clientX - 2});
        setSelectedPdf(pdf);
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
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#b0b0b0",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sortDirection={orderBy === 'fileName' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'fileName'}
                                    direction={orderBy === 'fileName' ? order : 'asc'}
                                    onClick={() => handleRequestSort('fileName')}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'size' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'size'}
                                    direction={orderBy === 'size' ? order : 'asc'}
                                    onClick={() => handleRequestSort('size')}
                                >
                                    Size
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'uploadedAt' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'uploadedAt'}
                                    direction={orderBy === 'uploadedAt' ? order : 'asc'}
                                    onClick={() => handleRequestSort('uploadedAt')}
                                >
                                    Uploaded At
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'labels' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'labels'}
                                    direction={orderBy === 'labels' ? order : 'asc'}
                                    onClick={() => handleRequestSort('labels')}
                                >
                                    Labels
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sortDirection={orderBy === 'description' ? order : false}>
                                <TableSortLabel
                                    active={orderBy === 'description'}
                                    direction={orderBy === 'description' ? order : 'asc'}
                                    onClick={() => handleRequestSort('description')}
                                >
                                    Description
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPdfs.map((pdf) => (
                            <TableRow
                                key={pdf.id}
                                hover
                                onClick={() => onRowClick(pdf)}
                                onContextMenu={(e) => handleRightClick(e, pdf)}
                                style={{cursor: "pointer"}}
                            >
                                <TableCell>{pdf.fileName}</TableCell>
                                <TableCell>{pdf.size}</TableCell>
                                <TableCell>{formatDate(pdf.uploadedAt)}</TableCell>
                                <TableCell>
                                    {Array.isArray(pdf.labels)
                                        ? pdf.labels.join(", ")
                                        : "No labels available"}
                                </TableCell>
                                <TableCell>{pdf.description || "No description available"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Context Menu */}
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

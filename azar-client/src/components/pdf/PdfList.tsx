import React, {MouseEvent, useEffect, useRef, useState} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,} from "@mui/material";
import {PdfFile} from "../../models/models.ts";
import PdfContextMenu from "./PdfContextMenu.tsx";

interface PdfListProps {
    pdfs: PdfFile[];
    onRowClick: (pdf: PdfFile) => void;
    onLoadMore: () => void;
    onDelete: (pdfId: string) => void;
    onEdit: (pdf: PdfFile) => void;
}

const PdfList: React.FC<PdfListProps> = ({pdfs, onRowClick, onLoadMore, onDelete, onEdit}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(
        null
    );
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);

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

    // Right-click logic
    const handleRightClick = (event: MouseEvent<HTMLTableRowElement>, pdf: PdfFile) => {
        event.preventDefault();
        setAnchorPosition({top: event.clientY - 4, left: event.clientX - 2});
        setSelectedPdf(pdf);
    };

    const handleCloseMenu = () => {
        setAnchorPosition(null);
        setSelectedPdf(null);
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
                            <TableCell>Name</TableCell>
                            <TableCell>Size</TableCell>
                            <TableCell>Uploaded At</TableCell>
                            <TableCell>Labels</TableCell>
                            <TableCell>Description</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pdfs.map((pdf) => (
                            <TableRow
                                key={pdf.id}
                                hover
                                onClick={() => onRowClick(pdf)}
                                onContextMenu={(e) => handleRightClick(e, pdf)}
                                style={{cursor: "pointer"}}
                            >
                                <TableCell>{pdf.fileName}</TableCell>
                                <TableCell>{pdf.size}</TableCell>
                                <TableCell>{pdf.uploadedAt}</TableCell>
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
            />
        </>
    );
};

export default PdfList;

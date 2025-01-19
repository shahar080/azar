import React, {useEffect, useRef} from "react";
import {Menu, MenuItem, useMediaQuery} from "@mui/material";
import {PdfFile} from "../../models/models.ts";
import {useTheme} from "@mui/material/styles";
import {getUserName} from "../../../shared/utils/AppState.ts";


interface PdfContextMenuProps {
    anchorPosition: { top: number; left: number } | null;
    pdfFile: PdfFile | null;
    onClose: () => void;
    onViewMore: (pdfFile: PdfFile) => void;
    onDownloadPdf: (userName: string, pdfFile: PdfFile) => void;
    onEdit: (pdf: PdfFile) => void;
    onDelete: (pdfId: string) => void;
    onShowPDF?: (pdf: PdfFile) => void;
}

const PdfContextMenu: React.FC<PdfContextMenuProps> = ({
                                                           anchorPosition,
                                                           pdfFile,
                                                           onClose,
                                                           onViewMore,
                                                           onDownloadPdf,
                                                           onEdit,
                                                           onDelete,
                                                           onShowPDF = undefined,
                                                       }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Adjusts for "md" (desktop screens and above)
    const userName = getUserName();

    // Close menu when mouse leaves the menu area
    const handleMouseLeave = () => {
        onClose();
    };

    // Effect to automatically close when anchorPosition is null
    useEffect(() => {
        if (!anchorPosition) {
            onClose();
        }
    }, [anchorPosition, onClose]);

    return (
        <Menu
            open={!!anchorPosition}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                anchorPosition
                    ? {top: anchorPosition.top, left: anchorPosition.left}
                    : undefined
            }
            MenuListProps={{
                onMouseLeave: handleMouseLeave, // Close on mouse leave
            }}
            ref={menuRef}
        >
            {isDesktop &&
                <MenuItem onClick={() => pdfFile && onViewMore(pdfFile)}>View more</MenuItem>}
            <MenuItem onClick={() => pdfFile && onDownloadPdf(userName, pdfFile)}>Download</MenuItem>
            <MenuItem onClick={() => pdfFile && onEdit(pdfFile)}>Edit</MenuItem>
            <MenuItem onClick={() => pdfFile && onDelete(pdfFile.id.toString())}>Delete</MenuItem>
            {onShowPDF &&
                <MenuItem onClick={() => pdfFile && onShowPDF(pdfFile)}>Show PDF</MenuItem>}
        </Menu>
    );
};

export default PdfContextMenu;

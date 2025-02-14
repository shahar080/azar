import React, {useEffect, useRef} from "react";
import {Menu, MenuItem} from "@mui/material";
import {Photo} from "../../models/models.ts";


interface GalleryContextMenuProps {
    anchorPosition: { top: number; left: number } | null;
    photo: Photo | null;
    onClose: () => void;
    onOpen: (photo: Photo) => void;
    onEdit: (photo: Photo) => void;
    onDelete: (photo: Photo) => void;
    onRefreshMetadata: (photo: Photo) => void;
}

const GalleryContextMenu: React.FC<GalleryContextMenuProps> = ({
                                                                   anchorPosition,
                                                                   photo,
                                                                   onClose,
                                                                   onOpen,
                                                                   onEdit,
                                                                   onDelete,
                                                                   onRefreshMetadata,
                                                               }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMouseLeave = () => {
        onClose();
    };

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
                onMouseLeave: handleMouseLeave,
            }}
            ref={menuRef}
        >
            <MenuItem onClick={() => photo && onOpen(photo)}>Open</MenuItem>
            <MenuItem onClick={() => photo && onEdit(photo)}>Edit</MenuItem>
            <MenuItem onClick={() => photo && onRefreshMetadata(photo)}>Refresh metadata</MenuItem>
            <MenuItem onClick={() => photo && onDelete(photo)}>Delete</MenuItem>
        </Menu>
    );
};

export default GalleryContextMenu;

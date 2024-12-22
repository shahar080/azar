import React, {useEffect, useRef} from "react";
import {Menu, MenuItem} from "@mui/material";
import {User} from "../../models/models.ts";

interface PdfContextMenuProps {
    anchorPosition: { top: number; left: number } | null;
    user: User | null;
    onClose: () => void;
    onEdit: (user: User) => void;
    onDelete: (userId: string | undefined) => void;
    onShowUser: (user: User) => void;
}

const UserContextMenu: React.FC<PdfContextMenuProps> = ({
                                                            anchorPosition,
                                                            user,
                                                            onClose,
                                                            onEdit,
                                                            onDelete,
                                                            onShowUser,
                                                        }) => {
    const menuRef = useRef<HTMLDivElement>(null);

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
            <MenuItem onClick={() => user && onShowUser(user)}>View</MenuItem>
            <MenuItem onClick={() => user && onEdit(user)}>Edit</MenuItem>
            <MenuItem onClick={() => user && onDelete(user?.id?.toString())}>Delete</MenuItem>
        </Menu>
    );
};

export default UserContextMenu;

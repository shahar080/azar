import React, {useEffect, useRef} from "react";
import {Menu, MenuItem} from "@mui/material";
import {BaseModel} from "../../../shared/models/models.ts";

interface BaseContextMenuProps<T> {
    anchorPosition: { top: number; left: number } | null;
    item: T | null;
    onClose: () => void;
    onEdit: (item: T) => void;
    onDelete: (itemId: string | undefined) => void;
    onShow: (item: T) => void;
}

const BaseContextMenu: React.FC<BaseContextMenuProps<BaseModel>> = ({
                                                            anchorPosition,
                                                            item,
                                                            onClose,
                                                            onEdit,
                                                            onDelete,
                                                            onShow,
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
            <MenuItem onClick={() => item && onShow(item)}>View</MenuItem>
            <MenuItem onClick={() => item && onEdit(item)}>Edit</MenuItem>
            <MenuItem onClick={() => item && onDelete(item?.id?.toString())}>Delete</MenuItem>
        </Menu>
    );
};

export default BaseContextMenu;

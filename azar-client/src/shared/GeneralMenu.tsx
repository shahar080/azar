import React, {useState} from "react";
import {Box, Button, Menu, MenuItem} from "@mui/material";
import {Link} from "react-router-dom";
import {CLOUD_ROUTE, LANDING_ROUTE} from "./utils/reactRoutes.ts";

export function GeneralMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {/* Dropdown Menu in Top Left */}
            <Box
                sx={{
                    position: "absolute",
                    top: "10px",
                    left: "20px",
                }}
            >
                <Button
                    onClick={handleClick}
                    variant="contained"
                    sx={{
                        backgroundColor: "primary",
                        color: "secondary",
                        textTransform: "none",
                        borderRadius: "10vw"
                    }}
                >
                    Menu
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose} component={Link} to={LANDING_ROUTE}>
                        Shahar
                    </MenuItem>
                    <MenuItem onClick={handleClose} component={Link} to={CLOUD_ROUTE}>
                        AzarCloud
                    </MenuItem>
                </Menu>
            </Box>
        </>
    );
}
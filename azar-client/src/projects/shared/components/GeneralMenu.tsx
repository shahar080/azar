import React, {useState} from "react";
import {Box, Button, GlobalStyles, Menu, MenuItem} from "@mui/material";
import {ArrowDropDown} from "@mui/icons-material";
import {Link} from "react-router-dom";
import {CLOUD_ROUTE, LANDING_ROUTE, WEATHER_ROUTE} from "../utils/reactRoutes.ts";
import {COMIC_NEUE_FONT} from "../utils/constants.ts";

type GeneralMenuProps = {
    zIndex?: number;
};

export function GeneralMenu({zIndex = 1}: GeneralMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <GlobalStyles
                styles={{
                    "*": {
                        fontFamily: COMIC_NEUE_FONT,
                    },
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    top: "10px",
                    left: "20px",
                    zIndex: zIndex === undefined ? -1 : zIndex,
                }}
            >
                <Button
                    onClick={handleClick}
                    variant="contained"
                    sx={{
                        backgroundColor: "primary.main",
                        color: "secondary.contrastText",
                        textTransform: "none",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    Menu
                    <ArrowDropDown/> {/* Down arrow icon */}
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    sx={{
                        mt: "0px",
                        "& .MuiPaper-root": {
                            backgroundColor: "transparent",
                            boxShadow: "none",
                        },
                        "& .MuiMenu-list": {
                            padding: "0",
                            backgroundColor: "primary.main",
                            borderRadius: "0 0 8px 8px",
                            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.25)",
                        },
                    }}
                >
                    <MenuItem
                        onClick={handleClose}
                        component={Link}
                        to={LANDING_ROUTE}
                        sx={{
                            padding: "12px 20px",
                            margin: "0",
                            borderRadius: "0 8px 0 0",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                                color: "secondary.contrastText",
                            },
                        }}
                    >
                        Shahar
                    </MenuItem>
                    <MenuItem
                        onClick={handleClose}
                        component={Link}
                        to={CLOUD_ROUTE}
                        sx={{
                            padding: "12px 20px",
                            margin: "0",
                            borderRadius: "0",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                                color: "secondary.contrastText",
                            },
                        }}
                    >
                        AzarCloud
                    </MenuItem>
                    <MenuItem
                        onClick={handleClose}
                        component={Link}
                        to={WEATHER_ROUTE}
                        sx={{
                            padding: "12px 20px",
                            margin: "0",
                            borderRadius: "0 0 8px 8px",
                            color: "white",
                            "&:hover": {
                                backgroundColor: "primary.dark",
                                color: "secondary.contrastText",
                            },
                        }}
                    >
                        Weather
                    </MenuItem>
                </Menu>

            </Box>
        </>
    );
}

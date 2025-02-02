import React, {useContext, useState} from "react";
import {Box, Button, GlobalStyles, Menu, MenuItem} from "@mui/material";
import {ArrowDropDown, Brightness4, Brightness7} from "@mui/icons-material";
import {Link} from "react-router-dom";
import {CLOUD_ROUTE, LANDING_ROUTE, WEATHER_ROUTE} from "../utils/reactRoutes.ts";
import {COMIC_NEUE_FONT} from "../utils/constants.ts";
import {ThemeModeContext} from "../../../theme/ThemeModeContext.tsx";

type GeneralMenuProps = {
    zIndex?: number;
};

export function GeneralMenu({zIndex = 1}: GeneralMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const {mode, setMode} = useContext(ThemeModeContext);

    const toggleTheme = () => {
        setMode(prev => (prev === 'light' ? 'dark' : 'light'));
    };

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
                    right: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    zIndex: zIndex === undefined ? -1 : zIndex,
                }}
            >
                <Box>
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
                        <ArrowDropDown/>
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

                <Button
                    variant="contained"
                    onClick={toggleTheme}
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
                    {mode === 'light' ? <Brightness4/> : <Brightness7/>}
                </Button>
            </Box>
        </>
    );
}

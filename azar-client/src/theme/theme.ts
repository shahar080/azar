import {createTheme} from "@mui/material/styles";

export const getTheme = (mode: "light" | "dark") =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: "#28b485",
            },
            secondary: {
                main: "#1c914a",
            },
            ...(mode === "light"
                ? {
                    background: {
                        default: "#f5f5f5",
                        paper: "#fff",
                    },
                }
                : {
                    background: {
                        default: "#252525",
                        paper: "#1d1d1d",
                    },
                }),
        },
    });

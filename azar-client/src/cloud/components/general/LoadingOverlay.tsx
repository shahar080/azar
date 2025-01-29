import React from "react";
import {Backdrop, CircularProgress} from "@mui/material";
import {useLoading} from "../../../shared/utils/loading/useLoading.ts";

const LoadingOverlay: React.FC = () => {
    const {isLoading} = useLoading();
    return (
        <Backdrop
            open={isLoading}
            sx={{
                color: "#fff",
                zIndex: 9999999,
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
            }}
        >
            <CircularProgress color="inherit"/>
        </Backdrop>
    );
};

export default LoadingOverlay;

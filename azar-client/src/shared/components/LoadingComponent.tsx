import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface LoadingComponentProps {
    status: "loading" | "success" | "error";
    message?: string;
}

const LoadingComponent: React.FC<LoadingComponentProps> = ({status, message}) => {
    const getIcon = () => {
        switch (status) {
            case "loading":
                return <CircularProgress/>;
            case "success":
                return <CheckCircleIcon color="success" sx={{fontSize: 50}}/>;
            case "error":
                return <ErrorIcon color="error" sx={{fontSize: 50, fill: "#ffffff"}}/>;
            default:
                return null;
        }
    };

    const getMessage = () => {
        switch (status) {
            case "loading":
                return message || "Sending...";
            case "success":
                return message || "Sent!";
            case "error":
                return message || "Error sending email";
            default:
                return "";
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{width: "100%", height: "100%"}}
        >
            {getIcon()}
            <Typography variant="body1" sx={{marginTop: 2}}>
                {getMessage()}
            </Typography>
        </Box>
    );
};

export default LoadingComponent;

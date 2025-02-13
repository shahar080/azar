import React, {useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {login} from "../../shared/store/authSlice.ts";
import {LoginForm} from "../components/general/LoginForm.tsx";
import {CLOUD_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";
import bgImage from '../../../img/whoami/bg.jpg';
import {LoginResponse} from "../../shared/server/api/responses.ts";
import {SourceCodeButton} from "../../shared/components/SourceCodeButton.tsx";

const CloudLandingPage: React.FC = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGetStarted = () => {
        setShowLoginForm(true);
    };

    const handleGoBack = () => {
        setShowLoginForm(false);
    };

    const onLoginSuccess = (loginResponse: LoginResponse) => {
        dispatch(login(loginResponse));
        navigate(CLOUD_ROUTE);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100vw",
                textAlign: "center",
                color: "#fff",
                background: (theme) => `
                        ${theme.palette.mode === "dark" ?
                    "linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 70%, black)" :
                    "linear-gradient(rgba(40, 180, 133, 0.1), rgba(28, 145, 74, 0.3))"},
                    url(${bgImage})
                    `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            <GeneralMenu/>
            <Typography
                variant="h2"
                color={"primary"}
                sx={{
                    marginBottom: showLoginForm ? 2 : 4,
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px black",
                }}
            >
                Welcome to AzarCloud
            </Typography>

            {!showLoginForm && (
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{marginBottom: 4}}
                >
                    Get Started
                </Button>
            )}

            {showLoginForm && (
                <LoginForm handleGoBack={handleGoBack} onLoginSuccess={onLoginSuccess}/>
            )}
            <SourceCodeButton/>
        </Box>
    );
};

export default CloudLandingPage;

import React, {useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {login} from "../store/authSlice.ts";
import {LoginForm} from "../components/general/LoginForm.tsx";
import {CLOUD_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {GeneralMenu} from "../../shared/GeneralMenu.tsx";
import {LoginResponse} from "../models/models.ts";
import bgImage from '../../img/whoami/bg.jpg';

const CloudLandingPage: React.FC = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGetStarted = () => {
        setShowLoginForm(true);
    };

    const handleCancel = () => {
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
                backgroundImage: `
            linear-gradient(rgba(40, 180, 133, 0.1), rgba(28, 145, 74, 0.3)),
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
                <LoginForm handleCancel={handleCancel} onLoginSuccess={onLoginSuccess}/>
            )}
        </Box>
    );
};

export default CloudLandingPage;

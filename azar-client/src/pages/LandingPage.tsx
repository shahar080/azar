import React, {useState} from 'react';
import {Box, Button, Typography} from '@mui/material';
import {LoginForm} from "../components/general/LoginForm.tsx"
import {useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {login} from '../store/authSlice';
import {LoginResponse} from "../models/models.ts";

const LandingPage: React.FC = () => {
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
        navigate('/');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                textAlign: 'center',
                color: '#fff',
                background: `
          linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), 
          url('/assets/temp_bg.jpg') no-repeat center center/cover
        `,
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            <Typography
                variant="h2"
                sx={{marginBottom: showLoginForm ? 2 : 4}}
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
                <LoginForm handleCancel={handleCancel}
                           onLoginSuccess={onLoginSuccess}/>
            )}
        </Box>
    );
};

export default LandingPage;

import React, {useState} from 'react';
import {Box, Button, TextField, Typography} from '@mui/material';

const LandingPage: React.FC = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);

    const handleGetStarted = () => {
        setShowLoginForm(true);
    };

    const handleCancel = () => {
        setShowLoginForm(false);
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
                <Typography variant="h6" sx={{marginBottom: 4}}>
                    Some cool text
                </Typography>
            )}

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
                <Box
                    component="form"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        width: '300px',
                    }}
                >
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        required
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        type="password"
                        fullWidth
                        required
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                    >
                        Login
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={handleCancel}
                        fullWidth
                    >
                        Cancel
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default LandingPage;

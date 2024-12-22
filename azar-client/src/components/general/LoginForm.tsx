import React, {useState} from 'react';
import {Box, Button, TextField, Typography} from '@mui/material';
import {login} from '../../server/api/userApi.ts';
import PasswordField from "./PasswordField.tsx";
import {LoginResponse} from "../../models/models.ts";
import {AxiosError} from "axios";

interface LoginFormProps {
    handleCancel: () => void;
    onLoginSuccess: (loginResponse: LoginResponse) => void;
    onLoginFailure: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({handleCancel, onLoginSuccess, onLoginFailure}) => {
    const [formData, setFormData] = useState({userName: '', password: ''});
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await login(formData);
            console.log('Login successful:', response);
            if (response) {
                onLoginSuccess(response);
            } else {
                onLoginFailure();
            }
            // Perform additional actions like saving a token or redirecting
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                setErrorMessage(error.response?.data?.message || 'Login failed');
            } else {
                setErrorMessage('An unexpected error occurred');
            }
            onLoginFailure();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                width: '300px',
                margin: '0 auto',
                marginTop: '5rem',
            }}
        >
            <Typography variant="h4" sx={{marginBottom: 2}}>
                Login
            </Typography>

            <TextField
                label="Username"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                fullWidth
                required
            />
            <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
                Login
            </Button>
            <>
            </>
            <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                fullWidth
            >
                Cancel
            </Button>
            {errorMessage && (
                <Typography color="error" sx={{marginTop: 1}}>
                    {errorMessage}
                </Typography>
            )}
        </Box>
    );
};

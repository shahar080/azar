import React, {useState} from "react";
import {Box, Button, TextField, Typography} from "@mui/material";
import {login} from "../../server/api/userApi.ts";
import PasswordField from "./PasswordField.tsx";
import {LoginResponse} from "../../models/models.ts";
import {AxiosError} from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import {AccountCircle} from "@mui/icons-material";
import {useLoading} from "../../utils/LoadingContext.tsx";

interface LoginFormProps {
    handleCancel: () => void;
    onLoginSuccess: (loginResponse: LoginResponse) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
                                                        handleCancel,
                                                        onLoginSuccess,
                                                    }) => {
    const [formData, setFormData] = useState({userName: "", password: ""});
    const [errorMessage, setErrorMessage] = useState("");
    const {setLoadingAnimation} = useLoading();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoadingAnimation(true);
        try {
            setErrorMessage(""); // Clear previous error

            const response = await login({currentUser: formData.userName, userNameAndPassword: formData});

            if (response?.success) {
                onLoginSuccess(response);
            } else {
                setErrorMessage("Invalid username or password. Please try again.");
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                // Display server-provided error message or fallback to a generic error
                setErrorMessage(
                    error.response?.data?.message || "Unable to login. Please try again."
                );
            } else {
                setErrorMessage("An unexpected error occurred. Please try again later.");
            }
        }
        setLoadingAnimation(false);

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
        setErrorMessage(""); // Clear error on user input
    };

    return (
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                width: "300px",
                margin: "0 auto",
                marginTop: "5rem",
                padding: "2rem",
                backgroundColor: "rgba(40, 180, 133, 0.1)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Add a shadow for depth
            }}
        >
            <Typography
                variant="h4"
                color={"primary"}
                sx={{
                    marginBottom: 2,
                    textShadow: "2px 2px 4px black",
                }}
            >
                Login
            </Typography>

            <TextField
                label="Username"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <AccountCircle/>
                        </InputAdornment>
                    ),
                }}
                InputLabelProps={{
                    sx: {
                        fontSize: "1.4rem", // Increase the font size of the label
                        fontWeight: "bold", // Optional: Make the label bold
                    },
                }}
                error={Boolean(errorMessage)}
                helperText={
                    errorMessage && formData.userName === ""
                        ? "Username is required"
                        : ""
                }
                FormHelperTextProps={{
                    sx: {pointerEvents: "none"}, // Prevent focus on helper text
                }}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "8px", // Consistent rounded corners
                    },
                }}
            />
            <PasswordField
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errorMessage) || formData.password === ""}
                helperText={
                    errorMessage && formData.password === ""
                        ? "Password is required"
                        : ""
                }
                InputLabelProps={{
                    sx: {
                        fontSize: "1.4rem", // Increase the font size of the label
                        fontWeight: "bold", // Optional: Make the label bold
                    },
                }}
            />
            <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                sx={{
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none", // Keep button text original case
                }}
            >
                Login
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleCancel}
                fullWidth
                sx={{
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    textTransform: "none",
                }}
            >
                Cancel
            </Button>
            {errorMessage &&
                formData.userName !== "" &&
                formData.password !== "" && (
                    <Typography color="error" sx={{marginTop: 1}}>
                        {errorMessage}
                    </Typography>
                )}
        </Box>
    );

};

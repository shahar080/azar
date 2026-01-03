import React, {useState} from "react";
import {Box, Button, GlobalStyles, TextField, Typography} from "@mui/material";
import {login} from "../../../shared/server/api/userApi.ts";
import PasswordField from "../../../shared/components/PasswordField.tsx";
import {AxiosError} from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import {AccountCircle} from "@mui/icons-material";
import {useLoading} from "../../../shared/utils/loading/useLoading.ts";
import {LoginResponse} from "../../../shared/server/api/responses.ts";

interface LoginFormProps {
    handleGoBack: () => void;
    onLoginSuccess: (loginResponse: LoginResponse) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
                                                        handleGoBack,
                                                        onLoginSuccess,
                                                    }) => {
    const [formData, setFormData] = useState({userName: "", password: ""});
    const [errorMessage, setErrorMessage] = useState("");
    const {setLoadingAnimation} = useLoading();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoadingAnimation(true);
        try {
            setErrorMessage("");

            const response = await login({userNameAndPassword: formData});

            if (response?.success) {
                onLoginSuccess(response);
            } else {
                setErrorMessage("Invalid username or password. Please try again.");
            }
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
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
        setErrorMessage("");
    };

    return (
        <>
            <GlobalStyles
                styles={{
                    "input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active": {
                        WebkitBoxShadow: "0 0 0 30px transparent inset !important",
                    },
                    "input:-webkit-autofill": {
                        WebkitTextFillColor: "#000",
                        transition: "background-color 5000s ease-in-out 0s",
                    },
                }}
            />

            <Box
                component="form"
                onSubmit={handleLogin}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    margin: "0 auto",
                    marginTop: "5rem",
                    padding: "2rem",
                    backgroundColor: "rgba(40, 180, 133, 0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
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
                            fontSize: "1.4rem",
                            fontWeight: "bold",
                        },
                    }}
                    error={Boolean(errorMessage)}
                    helperText={
                        errorMessage && formData.userName === ""
                            ? "Username is required"
                            : ""
                    }
                    FormHelperTextProps={{
                        sx: {pointerEvents: "none"},
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
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
                            fontSize: "1.4rem",
                            fontWeight: "bold",
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
                        textTransform: "none",
                    }}
                >
                    Login
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleGoBack}
                    fullWidth
                    sx={{
                        padding: "10px",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        textTransform: "none",
                    }}
                >
                    Go back
                </Button>
                {errorMessage &&
                    formData.userName !== "" &&
                    formData.password !== "" && (
                        <Typography color="error" sx={{marginTop: 1}}>
                            {errorMessage}
                        </Typography>
                    )}
            </Box>
        </>
    );
};

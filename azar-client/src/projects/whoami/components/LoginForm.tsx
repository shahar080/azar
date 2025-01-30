import React, {useState} from "react";
import {Box, Button, TextField, Typography} from "@mui/material";
import {AxiosError} from "axios";
import InputAdornment from "@mui/material/InputAdornment";
import {AccountCircle} from "@mui/icons-material";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import PasswordField from "../../shared/components/PasswordField.tsx";
import {getUserTypeFromStr, UserType} from "../../cloud/models/models.ts";
import {login} from "../../shared/server/api/userApi.ts";
import {getUserType} from "../../shared/utils/AppState.ts";
import {LoginResponse} from "../../cloud/server/api/responses.ts";

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
            setErrorMessage("");

            const response = await login({currentUser: formData.userName, userNameAndPassword: formData});

            if (response?.success) {
                if (getUserTypeFromStr(getUserType()) === UserType.ADMIN) {
                    onLoginSuccess(response);
                } else {
                    setErrorMessage("Unauthorized to login");
                }
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
        <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                width: "300px",
                margin: "0 auto",
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

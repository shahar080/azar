import {useState, useEffect} from "react";
import {Box, Button, GlobalStyles, Typography} from "@mui/material";
import {useSelector, useDispatch} from "react-redux";
import {LoginForm} from "../../cloud/components/general/LoginForm.tsx";
import {RootState} from "../../shared/store/store.ts";
import {login} from "../../shared/store/authSlice.ts";
import {LoginResponse} from "../../shared/server/api/responses.ts";
import {RedAlertDashboard} from "../components/RedAlertDashboard.tsx";

export function RedAlertHomePage() {
    const dispatch = useDispatch();
    const isStoreLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    const [showLoginForm, setShowLoginForm] = useState(false);

    // Sync local form state when the user is already logged in (e.g. from AzarCloud)
    useEffect(() => {
        if (isStoreLoggedIn) {
            setShowLoginForm(false);
        }
    }, [isStoreLoggedIn]);

    const handleLoginSuccess = (loginResponse: LoginResponse) => {
        dispatch(login(loginResponse));
        setShowLoginForm(false);
    };

    const handleGoBack = () => {
        setShowLoginForm(false);
    };

    return (
        <>
            <GlobalStyles
                styles={{
                    "*": {
                        boxSizing: "border-box",
                    },
                }}
            />
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100vw",
                    overflowX: "hidden",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
                dir="rtl"
            >
                <Box
                    sx={{
                        height: "100vh",
                        width: "100%",
                        background: (theme) => `
                        ${theme.palette.mode === "dark" ?
                            "linear-gradient(to bottom, rgba(100, 0, 0, 0.7) 70%, darkred)" :
                            "linear-gradient(to bottom, rgba(255, 0, 0, 0.4) 70%, red)"}
                        `,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {!isStoreLoggedIn ? (
                        showLoginForm ? (
                            <LoginForm
                                handleGoBack={handleGoBack}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        ) : (
                            <Box sx={{ textAlign: "center" }}>
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    color="white"
                                    sx={{ mb: 2 }}
                                >
                                    Red Alert
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={() => setShowLoginForm(true)}
                                >
                                    Login to Red Alert
                                </Button>
                            </Box>
                        )
                    ) : (
                        <Box sx={{ width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
                            <RedAlertDashboard />
                        </Box>
                    )}
                </Box>
            </Box>
        </>
    );
}

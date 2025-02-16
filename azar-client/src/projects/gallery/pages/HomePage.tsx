import {Box, Button, Modal, Typography, useMediaQuery,} from "@mui/material";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";
import {useState} from "react";
import {login} from "../../shared/store/authSlice.ts";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {GALLERY_MANAGE_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {SourceCodeButton} from "../../shared/components/SourceCodeButton.tsx";
import {useTheme} from "@mui/material/styles";
import {LoginResponse} from "../../shared/server/api/responses.ts";
import {LoginForm} from "../../shared/components/LoginForm.tsx";
import PhotoGallery from "../components/Gallery/PhotoGallery.tsx";

export function GalleryHomePage() {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = () => {
        setShowLoginForm(!showLoginForm);
    };

    const handleCancel = () => {
        setShowLoginForm(false);
    };

    const onLoginSuccess = (loginResponse: LoginResponse) => {
        dispatch(login(loginResponse));
        navigate(GALLERY_MANAGE_ROUTE);
        setShowLoginForm(false);
    };

    return (
        <Box
            sx={{
                backgroundColor: "primary",
                minHeight: "100vh",
                overflow: "hidden",
                width: "100vw",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    height: "30vh",
                    backgroundImage: `linear-gradient(to right bottom, rgba(126, 213, 111, 0.8), rgba(40, 180, 133, 0.8)), url(../../img/whoami/bg.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    clipPath: "polygon(0 0, 100% 0, 100% 20vh, 0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <GeneralMenu/>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        color: "white",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: {xs: "2rem", sm: "2.5rem", md: "3rem"},
                    }}
                >
                    Gallery
                </Typography>
            </Box>

            <PhotoGallery viewMode={"web"}/>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {!isMobile &&
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        sx={{
                            backgroundColor: "transparent",
                            color: "transparent",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            boxShadow: "none",
                            "&:hover": {
                                backgroundColor: "transparent",
                            },
                        }}
                    >
                        Login
                    </Button>
                }
            </Box>
            <SourceCodeButton/>
            <Modal open={showLoginForm} onClose={handleCancel}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        borderRadius: 2,
                        width: "90%",
                        maxWidth: "400px",
                        maxHeight: "90vh",
                        overflow: "auto",
                    }}
                >
                    <LoginForm handleCancel={handleCancel} onLoginSuccess={onLoginSuccess}/>
                </Box>
            </Modal>
        </Box>
    );
}

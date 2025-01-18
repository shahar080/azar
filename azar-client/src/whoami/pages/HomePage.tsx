import {Box, Button, ButtonBase, Container, Grid, Modal, Typography, useMediaQuery,} from "@mui/material";
import photo1 from "../../img/whoami/shahar/photo-1.jpg";
import photo2 from "../../img/whoami/shahar/photo-2.jpg";
import photo3 from "../../img/whoami/shahar/photo-3.jpg";
import {GeneralMenu} from "../../shared/GeneralMenu.tsx";
import {useEffect, useState} from "react";
import PdfModal from "../components/PdfModal.tsx";
import {useTheme} from "@mui/material/styles";
import {LoginForm} from "../components/LoginForm.tsx";
import {login} from "../../cloud/store/authSlice.ts";
import {useDispatch} from "react-redux";
import {LoginResponse} from "../../cloud/server/api/responses.ts";
import {useLoading} from "../../shared/utils/LoadingContext.tsx";
import {getWhoAmIData} from "../server/api/whoAmIDataApi.ts";
import {WhoAmIData} from "../models/models.ts";

export function WhoAmIHomePage() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isShowPDF, setShowPDF] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const {setLoadingAnimation} = useLoading();
    const dispatch = useDispatch();

    const [whoAmIData, setWhoAmIData] = useState<WhoAmIData>();

    const handleLogin = () => {
        setShowLoginForm(!showLoginForm);
    };

    const handleCancel = () => {
        setShowLoginForm(false);
    };

    const onLoginSuccess = (loginResponse: LoginResponse) => {
        dispatch(login(loginResponse));
        setIsEditMode(true);
        setShowLoginForm(false); // Close modal after successful login
    };

    useEffect(() => {
        setLoadingAnimation(true);
        getWhoAmIData()
            .then(whoAmIDataRes => {
                setWhoAmIData(whoAmIDataRes);
                setLoadingAnimation(false);
            })

    }, []);

    return (
        <Box
            sx={{
                backgroundColor: "#f7f7f7", // Light page background
                minHeight: "100vh",
                minWidth: "100vw",
            }}
        >
            {whoAmIData &&
                <>
                    {/* Header Section */}
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
                            {/* Header Content */}
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    color: "white",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: {xs: "2rem", sm: "2.5rem", md: "3rem"}, // Responsive font size
                                }}
                            >
                                {whoAmIData.headerTitle}
                                <Typography
                                    variant="h6"
                                    component="span"
                                    sx={{
                                        display: "block",
                                        mt: 1,
                                        color: "white",
                                        fontWeight: 300,
                                        fontSize: {xs: "1rem", sm: "1.25rem", md: "1.5rem"}, // Responsive font size
                                    }}
                                >
                                    {whoAmIData.headerIntro}
                                </Typography>
                            </Typography>
                        </Box>

                        {/* Main Content */}
                        <Container sx={{mt: {xs: 2, sm: 4, md: 5}}}>
                            {/* Title */}
                            <Typography
                                variant="h4"
                                component="h2"
                                align="center"
                                gutterBottom
                                sx={{
                                    color: "#28b485",
                                    fontWeight: "bold",
                                    fontSize: {xs: "1.5rem", sm: "2rem", md: "2.5rem"}, // Responsive font size
                                }}
                            >
                                {whoAmIData.mainContentQuestion}
                            </Typography>

                            {/* Content Grid */}
                            <Grid container spacing={4} alignItems="center">
                                {/* Left Column */}
                                <Grid item xs={12} md={6}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            color: "#333",
                                            fontSize: {xs: "1rem", sm: "1.25rem"},
                                        }}
                                    >
                                        {whoAmIData.mainContentFirstTitle}
                                    </Typography>
                                    {whoAmIData.mainContentFirstData.map((line) => (
                                        <Typography
                                            paragraph
                                            sx={{
                                                color: "#555",
                                                fontSize: {xs: "0.9rem", sm: "1rem"},
                                            }}
                                            key={line} // Always use a key when rendering lists
                                        >
                                            {line}
                                        </Typography>
                                    ))}
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            color: "#333",
                                            fontSize: {xs: "1rem", sm: "1.25rem"},
                                        }}
                                    >
                                        {whoAmIData.mainContentSecondTitle}
                                    </Typography>
                                    {whoAmIData.mainContentSecondData.map((line) => (
                                        <Typography
                                            paragraph
                                            sx={{
                                                color: "#555",
                                                fontSize: {xs: "0.9rem", sm: "1rem"},
                                            }}
                                            key={line} // Always use a key when rendering lists
                                        >
                                            {line}
                                        </Typography>
                                    ))}
                                    <Button
                                        component={ButtonBase}
                                        variant="outlined"
                                        onClick={() => setShowPDF(true)}
                                        sx={{
                                            mt: 2,
                                            borderColor: "#28b485",
                                            color: "#28b485",
                                            "&:hover": {
                                                backgroundColor: "#28b485",
                                                color: "white",
                                            },
                                            fontSize: {xs: "0.8rem", sm: "1rem"}, // Responsive font size
                                            padding: {xs: "6px 12px", sm: "8px 16px"}, // Responsive padding
                                        }}
                                    >
                                        {whoAmIData.cvButton}
                                    </Button>
                                </Grid>

                                {/* Right Column - Images */}
                                <Grid item xs={12} md={6}>
                                    <Box
                                        sx={{
                                            position: "relative",
                                            width: "100%",
                                            height: "300px",
                                        }}
                                    >
                                        {/* First Image */}
                                        <Box
                                            component="img"
                                            src={photo1}
                                            alt="Photo 1"
                                            sx={{
                                                position: "absolute",
                                                top: "-20px",
                                                left: "0",
                                                width: "45%",
                                                boxShadow: 3,
                                                borderRadius: 2,
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                },
                                            }}
                                        />
                                        {/* Second Image */}
                                        <Box
                                            component="img"
                                            src={photo2}
                                            alt="Photo 2"
                                            sx={{
                                                position: "absolute",
                                                top: "20px",
                                                right: "0",
                                                width: "45%",
                                                boxShadow: 3,
                                                borderRadius: 2,
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                },
                                            }}
                                        />
                                        {/* Third Image */}
                                        <Box
                                            component="img"
                                            src={photo3}
                                            alt="Photo 3"
                                            sx={{
                                                position: "absolute",
                                                top: "100px",
                                                left: "25%",
                                                width: "45%",
                                                boxShadow: 3,
                                                borderRadius: 2,
                                                transition: "all 0.2s",
                                                "&:hover": {
                                                    transform: "scale(1.05)",
                                                },
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Container>
                        {!isMobile && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "end",
                                    justifyContent: "end",
                                }}>
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
                            </Box>
                        )}
                        <PdfModal open={isShowPDF} onClose={() => setShowPDF(false)}/>
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
                                    width: "90%", // Adjust for responsiveness
                                    maxWidth: "400px", // Limit maximum width
                                    maxHeight: "90vh", // Ensure it doesn't exceed the viewport height
                                    overflow: "auto", // Add scroll if content exceeds max height
                                }}
                            >
                                <LoginForm handleCancel={handleCancel} onLoginSuccess={onLoginSuccess}/>
                            </Box>
                        </Modal>
                </>
            }
        </Box>
    );
}

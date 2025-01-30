import {Box, Button, ButtonBase, Container, Grid, Modal, Typography, useMediaQuery,} from "@mui/material";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";
import {useEffect, useState} from "react";
import PdfModal from "../components/PdfModal.tsx";
import {useTheme} from "@mui/material/styles";
import {LoginForm} from "../components/LoginForm.tsx";
import {login} from "../../shared/store/authSlice.ts";
import {useDispatch} from "react-redux";
import {LoginResponse} from "../../cloud/server/api/responses.ts";
import {getWhoAmIData} from "../server/api/whoAmIDataApi.ts";
import {WhoAmIData} from "../models/models.ts";
import {useNavigate} from "react-router-dom";
import {WHOAMI_MANAGE_CV_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {SourceCodeButton} from "../../shared/components/SourceCodeButton.tsx";

export function WhoAmIHomePage() {
    const [isShowPDF, setShowPDF] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [whoAmIData, setWhoAmIData] = useState<WhoAmIData>();

    const handleLogin = () => {
        setShowLoginForm(!showLoginForm);
    };

    const handleCancel = () => {
        setShowLoginForm(false);
    };

    const onLoginSuccess = (loginResponse: LoginResponse) => {
        dispatch(login(loginResponse));
        navigate(WHOAMI_MANAGE_CV_ROUTE);
        setShowLoginForm(false);
    };

    function calculateDynamicPosition(index: number, total: number) {
        const radius = isMobile ? 50 : 120;
        const angle = (2 * Math.PI * index) / total;

        const top = `${50 + radius * Math.sin(angle)}px`;
        const left = `${(isMobile ? 50 : 150) + radius * Math.cos(angle)}px`;

        return {top, left};
    }

    useEffect(() => {
        setIsLoading(true);
        getWhoAmIData()
            .then(whoAmIDataRes => {
                setWhoAmIData(whoAmIDataRes);
                setIsLoading(false);
            })

    }, []);

    return (
        <Box
            sx={{
                backgroundColor: "#f7f7f7",
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
                    {isLoading ? "Loading..." : whoAmIData?.headerTitle}
                    <Typography
                        variant="h6"
                        component="span"
                        sx={{
                            display: "block",
                            mt: 1,
                            color: "white",
                            fontWeight: 300,
                            fontSize: {xs: "1rem", sm: "1.25rem", md: "1.5rem"},
                        }}
                    >
                        {isLoading ? "Please wait" : whoAmIData?.headerIntro}
                    </Typography>
                </Typography>
            </Box>

            <Container sx={{mt: {xs: 2, sm: 4, md: 5}}}>
                <Typography
                    variant="h4"
                    component="h2"
                    align="center"
                    gutterBottom
                    sx={{
                        color: "#28b485",
                        fontWeight: "bold",
                        fontSize: {xs: "1.5rem", sm: "2rem", md: "2.5rem"},
                    }}
                >
                    {isLoading ? "Loading content..." : whoAmIData?.mainContentQuestion}
                </Typography>

                {isLoading ?
                    (
                        <Typography color="textSecondary">Loading details...</Typography>
                    ) :
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    color: "#333",
                                    fontSize: {xs: "1rem", sm: "1.25rem"},
                                }}
                            >
                                {whoAmIData?.mainContentFirstTitle}
                            </Typography>
                            {whoAmIData?.mainContentFirstData.map((line) => (
                                <Typography
                                    paragraph
                                    sx={{
                                        color: "#555",
                                        fontSize: {xs: "0.9rem", sm: "1rem"},
                                    }}
                                    key={line}
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
                                {whoAmIData?.mainContentSecondTitle}
                            </Typography>
                            {whoAmIData?.mainContentSecondData.map((line) => (
                                <Typography
                                    paragraph
                                    sx={{
                                        color: "#555",
                                        fontSize: {xs: "0.9rem", sm: "1rem"},
                                    }}
                                    key={line}
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
                                    fontSize: {xs: "0.8rem", sm: "1rem"},
                                    padding: {xs: "6px 12px", sm: "8px 16px"},
                                }}
                            >
                                {whoAmIData?.cvButton}
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    height: "300px",
                                }}
                            >
                                {whoAmIData?.photos.map((photo, index) => {
                                    const position = calculateDynamicPosition(index, whoAmIData.photos.length);
                                    return (
                                        <Box
                                            key={index}
                                            component="img"
                                            src={`data:image/jpeg;base64,${photo}`}
                                            alt={"photo"}
                                            sx={{
                                                position: "absolute",
                                                ...position,
                                                width: "45%",
                                                boxShadow: 3,
                                                borderRadius: 2,
                                                transition: "all 0.2s",
                                                zIndex: 1,
                                                "&:hover": {
                                                    transform: "scale(1.1)",
                                                    zIndex: 10,
                                                    boxShadow: 6,
                                                },
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Grid>
                    </Grid>}
            </Container>
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

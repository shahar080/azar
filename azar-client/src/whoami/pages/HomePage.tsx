import {Box, Button, ButtonBase, Container, Grid, Typography} from "@mui/material";
import photo1 from "../../img/whoami/shahar/photo-1.jpg";
import photo2 from "../../img/whoami/shahar/photo-2.jpg";
import photo3 from "../../img/whoami/shahar/photo-3.jpg";
import {GeneralMenu} from "../../shared/GeneralMenu.tsx";
import {useState} from "react";
import PdfModal from "../components/PdfModal.tsx";

export function WhoAmIHomePage() {
    const [isShowPDF, setShowPDF] = useState(false);

    return (
        <Box
            sx={{
                backgroundColor: "#f7f7f7", // Light page background
                minHeight: "100vh",
                minWidth: "100vw",
            }}
        >
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
                    Shahar Azar
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
                        Let me tell you about myself..
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
                    So.. Who am I?
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
                            With over 6 years of experience in software engineering, I specialize in backend development
                            and solving complex challenges with innovative and efficient solutions.
                        </Typography>
                        <Typography
                            paragraph
                            sx={{
                                color: "#555",
                                fontSize: {xs: "0.9rem", sm: "1rem"},
                            }}
                        >
                            Proficient in Java 9+, Python, Vert.x, Spring, Hibernate, SQL, and Docker.
                        </Typography>
                        <Typography
                            paragraph
                            sx={{
                                color: "#555",
                                fontSize: {xs: "0.9rem", sm: "1rem"},
                            }}
                        >
                            Experienced with cloud-native technologies, CI/CD pipelines, and databases like PostgreSQL
                            and MongoDB.
                        </Typography>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                color: "#333",
                                fontSize: {xs: "1rem", sm: "1.25rem"},
                            }}
                        >
                            A few key notes about me:
                        </Typography>
                        <Typography
                            paragraph
                            sx={{
                                color: "#555",
                                fontSize: {xs: "0.9rem", sm: "1rem"},
                            }}
                        >
                            √ Problem Solver: Optimized performance in critical systems, enhancing efficiency and
                            scalability.
                        </Typography>
                        <Typography
                            paragraph
                            sx={{
                                color: "#555",
                                fontSize: {xs: "0.9rem", sm: "1rem"},
                            }}
                        >
                            √ Mentor & Leader: Guided teams on best practices, fostering growth and knowledge sharing.
                        </Typography>
                        <Typography
                            paragraph
                            sx={{
                                color: "#555",
                                fontSize: {xs: "0.9rem", sm: "1rem"},
                            }}
                        >
                            √ Innovator: Delivered impactful solutions, including stateless microservices and custom
                            infrastructure improvements.
                        </Typography>
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
                            → Learn more ←
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
            <PdfModal open={isShowPDF} onClose={() => setShowPDF(false)}/>
        </Box>
    );
}

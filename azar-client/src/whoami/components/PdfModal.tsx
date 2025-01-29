import React, {useEffect, useState} from "react";
import {Box, Button, IconButton, Modal, TextField, Typography, useMediaQuery} from "@mui/material";
import {Close} from "@mui/icons-material";
import {getCV, sendToEmail} from "../server/api/cvApi.ts";
import {Document, Page} from "react-pdf";
import LoadingComponent from "../../shared/components/LoadingComponent.tsx";
import {useTheme} from "@mui/material/styles";

interface PdfModalProps {
    open: boolean;
    onClose: () => void;
}

const PdfModal: React.FC<PdfModalProps> = ({open, onClose}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState<string | null>(null);
    const [scale, setScale] = useState(isMobile ? 0.7 : 1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [status, setStatus] = useState<"loading" | "success" | "error" | "">("");
    const [emailButtonText, setEmailButtonText] = useState("Email me");

    useEffect(() => {
        if (open) {
            getCV()
                .then((blob) => {
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                })
                .catch((error) => {
                    console.error("Failed to fetch PDF", error);
                });
        }
    }, [open]);

    useEffect(() => {
        return () => {
            if (!open && pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
                setPdfUrl(null);
            }
        };
    }, [open, pdfUrl]);

    useEffect(() => {
        switch (status) {
            case "":
                setEmailButtonText("Email me");
                break;
            case "loading":
                setEmailButtonText("Sending...");
                break;
            case "success":
                setEmailButtonText("Send again");
                break;
            case "error":
                setEmailButtonText("Try again");
        }
    }, [status]);

    useEffect(() => {
        const updateContainerDimensions = () => {
            const container = document.getElementById("pdf-container");
            if (container) {
                const width = container.offsetWidth;
                const height = container.offsetHeight;
                setContainerWidth(width);
                setContainerHeight(height);

                const pdfDefaultWidth = 800;
                const pdfDefaultHeight = 1131;
                const scaleWidth = width / pdfDefaultWidth;
                const scaleHeight = height / pdfDefaultHeight;
                setScale(Math.min(scaleWidth, scaleHeight));
            }
        };

        updateContainerDimensions();
        window.addEventListener("resize", updateContainerDimensions);
        return () => {
            window.removeEventListener("resize", updateContainerDimensions);
        };
    }, [isMobile]);

    const handleClose = () => {
        setEmail("");
        setEmailError(null);
        setStatus("");
        onClose();
    };

    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSendEmail = async () => {
        if (!email) {
            setEmailError("Email is required.");
        } else if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError(null);
            setStatus("loading");

            try {
                const isSent = await sendToEmail({email});
                if (isSent) {
                    setStatus("success");
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Error sending email", error);
                setStatus("error");
            }
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "90%",
                    maxWidth: "1200px",
                    height: "90vh",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    overflow: "hidden",
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="primary">
                        Shahar Azar CV
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <Close/>
                    </IconButton>
                </Box>

                <Box
                    id="pdf-container"
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        justifyContent: isMobile ? "start" : "center",
                        alignItems: "flex-start",
                        backgroundColor: "#f5f5f5",
                        position: "relative",
                        "&::-webkit-scrollbar": {
                            width: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#90caf9",
                            borderRadius: "4px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            backgroundColor: "#42a5f5",
                        },
                    }}
                >
                    {status !== "" && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 10,
                            }}
                        >
                            <LoadingComponent status={status}/>
                        </Box>
                    )}

                    {pdfUrl ? (
                        <Document file={pdfUrl}>
                            <Page
                                pageNumber={1}
                                width={containerWidth}
                                height={containerHeight}
                                scale={scale}
                            />
                        </Document>
                    ) : (
                        <Typography>Loading PDF...</Typography>
                    )}

                    {!isMobile && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                zIndex: 20,
                            }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setScale((prev) => Math.min(prev + 0.1, 2.0))}
                            >
                                +
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
                            >
                                -
                            </Button>
                        </Box>
                    )}
                </Box>

                <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                    sx={{gap: 2}}
                >
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (pdfUrl) {
                                const a = document.createElement("a");
                                a.href = pdfUrl;
                                a.download = "Shahar_Azar_CV.pdf";
                                a.click();
                            }
                        }}
                    >
                        Download PDF
                    </Button>
                    <Box display="flex" gap={2} alignItems="center">
                        <TextField
                            label="Email"
                            autoComplete={"email"}
                            type="email"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={!!emailError}
                            helperText={emailError}
                            disabled={status === "loading"}
                        />
                        <Button variant="contained" onClick={handleSendEmail} disabled={status === "loading"}>
                            {emailButtonText}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default PdfModal;

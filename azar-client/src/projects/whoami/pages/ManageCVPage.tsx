import React, {useState} from "react";
import {Box, Button, CssBaseline, Grid, Toolbar} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import {
    WHOAMI_MANAGE_CV_ROUTE,
    WHOAMI_MANAGE_EMAIL_ROUTE,
    WHOAMI_MANAGE_WHOAMI_ROUTE
} from "../../shared/utils/reactRoutes.ts";
import {useNavigate} from "react-router-dom";
import WhoAmIDrawerMenu from "../components/DrawerMenu.tsx";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {getUserName} from "../../shared/utils/AppState.ts";
import {updateCV} from "../server/api/cvApi.ts";
import PdfModal from "../components/PdfModal.tsx";

const WhoAmIManageCVPage: React.FC = () => {
    const [isShowPDF, setShowPDF] = useState(false);
    const {setLoadingAnimation} = useLoading();
    const {showToast} = useToast();
    const navigate = useNavigate();

    const userName = getUserName();

    const handleOnUploadCV = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setLoadingAnimation(true);
            if (userName === null) {
                showToast("Error uploading CV \"" + file.name + "\"", "error");
                return;
            }
            updateCV(file, userName).then((newPdf) => {
                if (newPdf !== undefined) {
                    showToast("Successfully uploaded CV \"" + file.name + "\"", "success");
                } else {
                    showToast("Error uploading CV \"" + file.name + "\"", "error");
                }
            }).finally(() => {
                setLoadingAnimation(false);
            });
        }
    }

    return (
        <Box sx={{display: 'flex', height: '100vh', width: '100vw'}}>
            <CssBaseline/>

            <AppBarHeader title={"WhoAmI Admin"} onLogoClick={() => navigate(WHOAMI_MANAGE_CV_ROUTE)}/>

            <WhoAmIDrawerMenu
                onManageCV={() => navigate(WHOAMI_MANAGE_CV_ROUTE)}
                onManageWhoAmI={() => navigate(WHOAMI_MANAGE_WHOAMI_ROUTE)}
                onManageEmail={() => navigate(WHOAMI_MANAGE_EMAIL_ROUTE)}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    width: "100%",
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Toolbar/>

                <Grid container spacing={2} sx={{height: "100%"}}>
                    <Grid item xs={12} md={8} sx={{display: "flex", flexDirection: "column", gap: 2, height: "100%"}}>
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
                            <Box>
                                <Button
                                    variant="contained"
                                    component={"label"}
                                    color="primary"
                                    onClick={() => setShowPDF(true)}
                                    sx={{margin: 4}}
                                >
                                    Current CV
                                </Button>
                                <Button variant="contained" component="label" color="primary">
                                    Upload New CV
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleOnUploadCV}
                                        accept="application/pdf"
                                    />
                                </Button>
                                <PdfModal open={isShowPDF} onClose={() => setShowPDF(false)}/>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default WhoAmIManageCVPage;

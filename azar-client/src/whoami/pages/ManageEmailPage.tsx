import React, {useEffect, useState} from "react";
import {Box, Button, CssBaseline, TextField, Toolbar, Typography,} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import {
    WHOAMI_MANAGE_CV_ROUTE,
    WHOAMI_MANAGE_EMAIL_ROUTE,
    WHOAMI_MANAGE_WHOAMI_ROUTE
} from "../../shared/utils/reactRoutes.ts";
import {useNavigate} from "react-router-dom";
import WhoAmIDrawerMenu from "../components/DrawerMenu.tsx";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import {getUserName} from "../../shared/utils/AppState.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {EmailData} from "../models/models.ts";
import {getEmailData, updateEmailData} from "../server/api/EmailDataApi.ts";

const initialData: EmailData = {
    title: "",
    body: "",
};

const ManageEmailPage: React.FC = () => {
    const [formData, setFormData] = useState<EmailData>(initialData);
    const userName = getUserName();
    const {setLoadingAnimation} = useLoading();
    const navigate = useNavigate();
    const {showToast} = useToast();

    const handleInputChange = (
        field: keyof EmailData,
        value: string | string[],
    ) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSave = () => {
        setLoadingAnimation(true);

        updateEmailData({emailData: formData, currentUser: userName})
            .then(res => {
                if (res) {
                    showToast("Successfully updated email data", "success")
                } else {
                    showToast("Error updating email data", "error")
                }
            })
            .finally(() => setLoadingAnimation(false));
    };

    useEffect(() => {
        setLoadingAnimation(true);
        getEmailData()
            .then(value => {
                setFormData(value);
            })
            .finally(() => setLoadingAnimation(false))
    }, [setLoadingAnimation]);

    return (
        <Box sx={{
            display: "flex",
            height: "100%",
            width: "99vw",
        }}>
            <CssBaseline/>
            <AppBarHeader
                title={"WhoAmI Admin"}
                onLogoClick={() => navigate(WHOAMI_MANAGE_CV_ROUTE)}
            />

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
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Toolbar/>
                <Typography component="h1" variant="h5" gutterBottom>
                    Edit Email Data
                </Typography>

                <Box
                    component="form"
                    sx={{
                        mt: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxWidth: "80%",
                    }}
                >
                    <TextField
                        label="Email Title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Email Body"
                        value={formData.body}
                        onChange={(e) => handleInputChange("body", e.target.value)}
                        fullWidth
                        multiline
                        size="small"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{
                            mt: 2,
                            alignSelf: "flex-start",
                        }}
                        onClick={handleSave}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ManageEmailPage;

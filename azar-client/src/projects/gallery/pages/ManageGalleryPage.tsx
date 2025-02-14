import React from "react";
import {Box, CssBaseline, Grid, Toolbar} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import {GALLERY_MANAGE_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {useNavigate} from "react-router-dom";
import GalleryDrawerMenu from "../components/DrawerMenu.tsx";
import PhotoList from "../components/PhotoList.tsx";

const ManageGalleryPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{display: 'flex', height: '100%', width: '100%'}}>
            <CssBaseline/>

            <AppBarHeader title={"Gallery Admin"} onLogoClick={() => navigate(GALLERY_MANAGE_ROUTE)}/>

            <GalleryDrawerMenu
                onManagePhotos={() => navigate(GALLERY_MANAGE_ROUTE)}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    width: "100%",
                    height: "100%",
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Toolbar/>

                <Grid container spacing={2} sx={{height: "100%", width: "100%"}}>
                    <Grid item xs={12} md={8} sx={{display: "flex", flexDirection: "column", gap: 2, height: "100%"}}>
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
                            <PhotoList/>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ManageGalleryPage;

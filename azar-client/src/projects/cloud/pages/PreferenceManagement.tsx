import React, {useCallback, useContext, useEffect, useState} from "react";
import {Box, CssBaseline, FormControlLabel, Grid, Switch, Toolbar, Typography, useMediaQuery} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import CloudDrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../../shared/store/store.ts";
import {getUserTypeFromStr, Preference} from "../models/models.ts";
import {useTheme} from "@mui/material/styles";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import {getAllPreferences, updatePreference} from "../server/api/preferencesApi.ts";
import {
    getDrawerPinnedState,
    getUserId,
    getUserName,
    getUserType,
    setDrawerPinnedState
} from "../../shared/utils/AppState.ts";
import {DARK_MODE_STR, DRAWER_PIN_STR} from "../utils/constants.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {CLOUD_LOGIN_ROUTE, CLOUD_MANAGE_USERS_ROUTE, CLOUD_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {drawerWidth} from "../../shared/utils/constants.ts";
import {pinDrawer, toggleDrawer} from "../components/sharedLogic.ts";
import {ThemeModeContext} from "../../../theme/ThemeModeContext.tsx";

const CloudPreferenceManagement: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const [drawerPinned, setDrawerPinned] = useState(isDesktop && getDrawerPinnedState());
    const [drawerOpen, setDrawerOpen] = useState(drawerPinned);
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const {mode, setMode} = useContext(ThemeModeContext);
    const {setLoadingAnimation} = useLoading();

    const {showToast} = useToast();

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = getUserName();
    const userId = getUserId();
    const userType = getUserTypeFromStr(getUserType());
    const navigate = useNavigate();

    const loadPreferences = useCallback(
        (forceLoad: boolean = false) => {
            if (!forceLoad && (loading || !hasMore)) return;

            setLoading(true);
            setLoadingAnimation(true);

            const currentPage = forceLoad ? 1 : page;

            getAllPreferences({currentUser: userName, userId: userId}, currentPage, 20)
                .then((newPreferences) => {
                    if (newPreferences.length < 20) {
                        setHasMore(false);
                    }

                    setPreferences((prevPreferences) =>
                        forceLoad ? newPreferences : [...prevPreferences, ...newPreferences]
                    );

                    if (!forceLoad) {
                        setPage((prev) => prev + 1);
                    }
                })
                .catch((err) => console.error("Failed to load preferences:", err))
                .finally(() => {
                    setLoading(false);
                    setLoadingAnimation(false);
                });
        }, [loading, hasMore, page, userName, userId, setLoading, setLoadingAnimation, setHasMore,
            setPreferences, setPage,]
    );

    useEffect(() => {
        if (!isLoggedIn) {
            setPreferences([]);
            navigate(CLOUD_LOGIN_ROUTE);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadPreferences();
    }, [loadPreferences]);

    const resetPaginationAndReload = () => {
        setPage(1);
        setHasMore(true);
        setPreferences([]);
        loadPreferences(true);
    };

    const handleManageUser = () => {
        navigate(CLOUD_MANAGE_USERS_ROUTE);
    }

    const handleManagePreferences = () => {
        resetPaginationAndReload();
    }

    const handleDrawerPinnedPreference = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked
        const updatedPreference = {
            userId: Number(getUserId()),
            key: DRAWER_PIN_STR,
            value: isChecked.toString(),
        }
        updatePreference({preference: updatedPreference, currentUser: userName})
            .then(updatedResult => {
                if (updatedResult) {
                    const updatedPreferences = preferences.map((preference) => (preference.id === updatedResult.id ? updatedResult : preference));
                    setPreferences(updatedPreferences);
                    setDrawerPinnedState(isChecked);
                    setDrawerPinned(isChecked);
                    setDrawerOpen(isChecked);
                } else {
                    showToast("Error updating preference drawer pinned", "error")
                }
            })
    };

    const handleDarkModePreference = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked
        const updatedPreference = {
            userId: Number(getUserId()),
            key: DARK_MODE_STR,
            value: isChecked.toString(),
        }
        updatePreference({preference: updatedPreference, currentUser: userName})
            .then(updatedResult => {
                if (updatedResult) {
                    const updatedPreferences = preferences.map((preference) => (preference.id === updatedResult.id ? updatedResult : preference));
                    setPreferences(updatedPreferences);
                    setMode(isChecked ? "dark" : "light");
                } else {
                    showToast("Error updating preference dark mode", "error")
                }
            })
    };

    return (
        <Box sx={{display: 'flex', height: '100vh', width: '100vw'}}>
            <CssBaseline/>

            <AppBarHeader onMenuToggle={() => toggleDrawer(drawerPinned, setDrawerOpen, drawerOpen)}
                          onLogoClick={() => navigate(CLOUD_ROUTE)}/>

            <CloudDrawerMenu
                open={drawerOpen}
                pinned={drawerPinned}
                onPinToggle={() => pinDrawer(setDrawerPinned, setDrawerOpen, userName, showToast)}
                onManageUser={handleManageUser}
                onManagePreferences={handleManagePreferences}
                onClose={() => setDrawerOpen(false)}
                userType={userType}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    width: drawerPinned ? `calc(100% - ${drawerWidth}px)` : "100%",
                    transition: "margin-left 0.3s ease, width 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Toolbar/>
                <Typography
                    variant="h2"
                    component="h1"
                    sx={{
                        color: "primary",
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: {xs: "2rem", sm: "2.5rem", md: "3rem"},
                        paddingLeft: "1vw",
                        paddingBottom: "1vw",
                    }}
                >
                    {"Preferences"}
                </Typography>
                <Grid container spacing={2} sx={{height: "100%"}}>
                    <Grid item xs={12} md={8} sx={{display: "flex", flexDirection: "column", gap: 2, height: "100%"}}>
                        <Box sx={{
                            flexGrow: 1,
                            overflow: "hidden",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start"
                        }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={drawerPinned}
                                        onChange={handleDrawerPinnedPreference}
                                        color="primary"
                                    />
                                }
                                label={`Pin Drawer`}
                                labelPlacement={"start"}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={mode === "dark"}
                                        onChange={handleDarkModePreference}
                                        color="primary"
                                    />
                                }
                                label={`Dark mode`}
                                labelPlacement={"start"}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CloudPreferenceManagement;

import React, {useEffect, useState} from "react";
import {Box, CssBaseline, FormControlLabel, Grid, Switch, Toolbar, useMediaQuery} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import CloudDrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../../shared/store/store.ts";
import {getUserTypeFromStr, Preference} from "../models/models.ts";
import {useTheme} from "@mui/material/styles";
import SearchBar from "../components/general/SearchBar.tsx";
import {useLoading} from "../../shared/utils/LoadingContext.tsx";
import {getAllPreferences, updatePreference} from "../server/api/preferencesApi.ts";
import {
    getDrawerPinnedState,
    getUserId,
    getUserName,
    getUserType,
    setDrawerPinnedState
} from "../../shared/utils/AppState.ts";
import {DRAWER_PIN_STR} from "../utils/constants.ts";
import {useToast} from "../../shared/utils/ToastContext.tsx";
import {CLOUD_LOGIN_ROUTE, CLOUD_MANAGE_USERS_ROUTE, CLOUD_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {drawerWidth} from "../../shared/utils/constants.ts";

const CloudPreferenceManagement: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Adjusts for "md" (desktop screens and above)
    const [drawerPinned, setDrawerPinned] = useState(isDesktop && getDrawerPinnedState());
    const [drawerOpen, setDrawerOpen] = useState(drawerPinned);
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [filteredPreferences, setFilteredPreferences] = useState<Preference[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const {setLoadingAnimation} = useLoading();

    const {showToast} = useToast();

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = getUserName();
    const userId = getUserId();
    const userType = getUserTypeFromStr(getUserType());
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setPreferences([]);
            setFilteredPreferences([]);
            navigate(CLOUD_LOGIN_ROUTE);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadPreferences();
    }, []);

    useEffect(() => {
        if (filteredPreferences.length > 0) {
            const drawerPinned = filteredPreferences.filter(pref => pref.key === DRAWER_PIN_STR) || []
            if (drawerPinned.length > 0) {
                setDrawerPinned(JSON.parse(drawerPinned[0].value))
            }
        }
    }, [filteredPreferences])

    const loadPreferences = (forceLoad: boolean = false) => {
        if (!forceLoad && (loading || !hasMore)) return;
        setLoading(true);

        const currentPage = forceLoad ? 1 : page;
        setLoadingAnimation(true);
        getAllPreferences({currentUser: userName, userId: userId}, currentPage, 20)
            .then((newPreferences) => {
                if (newPreferences.length < 20) {
                    setHasMore(false);
                }

                // If forceLoad is true, replace PDFs; otherwise, append
                setPreferences((prevPreferences) => (forceLoad ? newPreferences : [...prevPreferences, ...newPreferences]));
                setFilteredPreferences((prevPreferences) => (forceLoad ? newPreferences : [...prevPreferences, ...newPreferences]));

                if (!forceLoad) {
                    setPage((prev) => prev + 1); // Increment page only if not forcing reload
                }
            })
            .catch((err) => console.error("Failed to load preferences:", err))
            .finally(() => {
                setLoading(false);
                setLoadingAnimation(false);
            });
    };


    const handleSearch = (query: string) => {
        setPage(1);
        setHasMore(true);

        const filteredResults = preferences.filter((preference) => {
            return preference.key.toLowerCase().includes(query.toLowerCase()) ||
                preference.value.toLowerCase().includes(query.toLowerCase());
        });

        setFilteredPreferences(filteredResults);
    };

    const resetPaginationAndReload = () => {
        setPage(1);
        setHasMore(true);
        setPreferences([]); // Clear the list of PDFs
        loadPreferences(true); // Force reload starting from page 1
    };

    const toggleDrawer = () => {
        if (!drawerPinned) {
            setDrawerOpen(!drawerOpen);
        }
    };

    const pinDrawer = () => {
        setDrawerPinned((prevPinned) => {
            setDrawerOpen(!prevPinned); // Close the drawer when unpinning
            const updatedPreference = {
                userId: Number(getUserId()),
                key: DRAWER_PIN_STR,
                value: (!prevPinned).toString()
            }
            updatePreference({preference: updatedPreference, currentUser: userName})
                .then(updatedPreference => {
                    if (updatedPreference) {
                        setDrawerPinnedState(JSON.parse(updatedPreference.value));
                        setDrawerPinned(JSON.parse(updatedPreference.value));
                        setDrawerOpen(JSON.parse(updatedPreference.value));
                    } else {
                        showToast("Error updating preference drawer pinned", "error")
                    }
                })
            return !prevPinned;
        });
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
                    const tempPreferences = preferences.map((preference) => (preference.id === updatedResult.id ? updatedResult : preference));
                    setPreferences(tempPreferences);
                    setFilteredPreferences((prev) =>
                        prev.map((preference) => (preference.id === updatedResult.id ? updatedResult : preference))
                    );
                    setDrawerPinnedState(isChecked);
                    setDrawerPinned(isChecked);
                    setDrawerOpen(isChecked);
                } else {
                    showToast("Error updating preference drawer pinned", "error")
                }
            })
    };

    return (
        <Box sx={{display: 'flex', height: '100vh', width: '100vw'}}>
            <CssBaseline/>

            {/* AppBar */}
            <AppBarHeader onMenuToggle={toggleDrawer} onLogoClick={() => navigate(CLOUD_ROUTE)}/>

            {/* Drawer */}
            <CloudDrawerMenu
                open={drawerOpen}
                pinned={drawerPinned}
                onPinToggle={pinDrawer}
                onManageUser={handleManageUser}
                onManagePreferences={handleManagePreferences}
                onClose={() => setDrawerOpen(false)}
                userType={userType}
            />

            {/* Main Content */}
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
                {/* Ensures AppBar Offset */}
                <Toolbar/>

                {/* Grid Layout */}
                <Grid container spacing={2} sx={{height: "100%"}}>
                    {/* Left Section: Search and PDF Table */}
                    <Grid item xs={12} md={8} sx={{display: "flex", flexDirection: "column", gap: 2, height: "100%"}}>
                        <SearchBar
                            onSearch={handleSearch}
                        />
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
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
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default CloudPreferenceManagement;

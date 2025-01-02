import React, {useEffect, useState} from "react";
import {Box, CssBaseline, Grid, Toolbar, useMediaQuery} from "@mui/material";
import AppBarHeader from "../components/general/AppBarHeader.tsx";
import DrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../store/store";
import {getUserType, Preference} from "../models/models";
import {useTheme} from "@mui/material/styles";
import SearchBarWithAdd from "../components/general/SearchBarWithAdd.tsx";
import {useLoading} from "../utils/LoadingContext.tsx";
import {useToast} from "../utils/ToastContext.tsx";
import {add, deletePreference, getAllPreferences, updatePreference} from "../server/api/preferencesApi.ts";
import PreferencesList from "../components/preferences/PreferencesList.tsx";
import PreferenceModal from "../components/preferences/PreferenceModal.tsx";

const drawerWidth = 240;

const PreferenceManagement: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Adjusts for "md" (desktop screens and above)
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPinned, setDrawerPinned] = useState(isDesktop);
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [filteredPreferences, setFilteredPreferences] = useState<Preference[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedPreferenceForOp, setSelectedPreferenceForOp] = useState<Preference | null>(null);
    const [isAddPreference, setAddPreference] = useState<boolean>(false);
    const {setLoadingAnimation} = useLoading();
    const {showToast} = useToast();

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = localStorage.getItem('userName') || '';
    const userId = localStorage.getItem('userId') || '';
    const userType = getUserType(localStorage.getItem('userType'));
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setPreferences([]);
            setFilteredPreferences([]);
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadPreferences();
    }, []);

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

    const handleDeletePreference = (preference: Preference) => {
        setLoadingAnimation(true);
        if (preference.id === undefined || userName === null) {
            setLoadingAnimation(false);
            return false;
        }
        deletePreference(preference.id, {currentUser: userName})
            .then((res) => {
                resetPaginationAndReload();
                if (res) {
                    showToast("Preference \"" + preference.key + "\" deleted successfully.", "success")
                } else {
                    showToast("Error deleting preference: \"" + preference.key + "\"", "error")
                }
            })
            .catch((error) => {
                console.error("Failed to delete preference:", error);
            })
            .finally(() => setLoadingAnimation(false));
    };

    const handleEditPreference = (preference: Preference) => {
        setSelectedPreferenceForOp(preference);
        setEditModalOpen(true);
    };

    const handleShowPreference = (preference: Preference) => {
        setSelectedPreferenceForOp(preference);
        setViewModalOpen(true);
    }

    const handleSaveEdit = (updatedPreference: Preference) => {
        setLoadingAnimation(true);
        updatePreference({preference: updatedPreference, currentUser: userName})
            .then((res) => {
                if (res) {
                    showToast("Preference \"" + updatedPreference.key + "\" updated successfully.", "success")
                    const tempPreferences = preferences.map((preferences) => (preferences.id === updatedPreference.id ? updatedPreference : preferences));
                    setPreferences(tempPreferences);
                    setFilteredPreferences((prev) =>
                        prev.map((preference) => (preference.id === updatedPreference.id ? updatedPreference : preference))
                    );
                } else {
                    showToast("Error updating preference \"" + updatedPreference.key + " | " + updatedPreference.value + "\"", "error")
                }
            })
            .finally(() => {
                setLoadingAnimation(false);
            })
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
            if (prevPinned) {
                setDrawerOpen(false); // Close the drawer when unpinning
            }
            return !prevPinned;
        });
    };

    const handleOnAddPreference = () => {
        setAddPreference(true);
    }

    const handleAddPreference = (preference: Preference) => {
        setLoadingAnimation(true);
        if (userName === null) {
            showToast("Error adding preference \"" + preference.key + "\"", "error");
            return;
        }
        add({currentUser: userName, preference: preference}).then((success) => {
                resetPaginationAndReload();
                if (success) {
                    showToast("preference \"" + preference.key + "\" added successfully.", "success");
                } else {
                    showToast("Error adding preference \"" + preference.key + "\"", "error");
                }
            }
        ).finally(() => setLoadingAnimation(false))
    }

    const handleManageUser = () => {
        navigate("/manage-users");
    }

    const handleManagePreferences = () => {
        resetPaginationAndReload();
    }

    return (
        <Box sx={{display: 'flex', height: '100vh', width: '100vw'}}>
            <CssBaseline/>

            {/* AppBar */}
            <AppBarHeader onMenuToggle={toggleDrawer} onLogoClick={() => navigate('/')}/>

            {/* Drawer */}
            <DrawerMenu
                open={drawerOpen}
                pinned={drawerPinned}
                onPinToggle={pinDrawer}
                onNavigate={() => {
                }}
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
                        <SearchBarWithAdd
                            onSearch={handleSearch}
                            onAddOperation={handleOnAddPreference}
                        />
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
                            <PreferencesList
                                preferences={filteredPreferences}
                                onLoadMore={loadPreferences}
                                onDelete={handleDeletePreference}
                                onEdit={handleEditPreference}
                                onShowPreference={handleShowPreference}
                                isAddPreference={isAddPreference}
                                setIsAddPreference={() => setAddPreference(false)}
                                handleAddPreference={handleAddPreference}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <PreferenceModal
                open={isViewModalOpen}
                preference={selectedPreferenceForOp}
                onClose={() => setViewModalOpen(false)}
                mode="view"
            />

            <PreferenceModal
                open={isEditModalOpen}
                preference={selectedPreferenceForOp}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveEdit}
                mode="edit"
            />
        </Box>
    );
};

export default PreferenceManagement;

import React, {useEffect, useState} from "react";
import {Box, CssBaseline, Grid, Toolbar, useMediaQuery} from "@mui/material";
import AppBarHeader from "../components/general/AppBarHeader.tsx";
import DrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../store/store.ts";
import {add, deleteUser, getAllUsers, updateUser} from "../../shared/server/api/userApi.ts";
import {getUserTypeFromStr, User} from "../models/models.ts";
import {useTheme} from "@mui/material/styles";
import SearchBar from "../components/general/SearchBar.tsx";
import UserList from "../components/user/UserList.tsx";
import UserModal from "../components/user/UserModal.tsx";
import {useLoading} from "../../shared/utils/LoadingContext.tsx";
import {useToast} from "../utils/ToastContext.tsx";
import {getDrawerPinnedState, getUserId, getUserName, getUserType, setDrawerPinnedState} from "../utils/AppState.ts";
import {DRAWER_PIN_STR} from "../utils/constants.ts";
import {updatePreference} from "../server/api/preferencesApi.ts";
import {LOGIN_ROUTE, MANAGE_PREFERENCES_ROUTE} from "../../shared/utils/reactRoutes.ts";

const drawerWidth = 240;

const CloudUserManagement: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Adjusts for "md" (desktop screens and above)
    const [drawerPinned, setDrawerPinned] = useState(isDesktop && getDrawerPinnedState());
    const [drawerOpen, setDrawerOpen] = useState(drawerPinned);
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedUserForOp, setSelectedUserForOp] = useState<User | null>(null);
    const [isAddUser, setAddUser] = useState<boolean>(false);
    const {setLoadingAnimation} = useLoading();
    const {showToast} = useToast();

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = getUserName();
    const userType = getUserTypeFromStr(getUserType());
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setUsers([]);
            setFilteredUsers([]);
            navigate(LOGIN_ROUTE);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = (forceLoad: boolean = false) => {
        if (!forceLoad && (loading || !hasMore)) return;
        setLoading(true);

        const currentPage = forceLoad ? 1 : page;
        setLoadingAnimation(true);
        getAllUsers({currentUser: userName}, currentPage, 20)
            .then((newUsers) => {
                if (newUsers.length < 20) {
                    setHasMore(false);
                }

                // If forceLoad is true, replace PDFs; otherwise, append
                setUsers((prevUsers) => (forceLoad ? newUsers : [...prevUsers, ...newUsers]));
                setFilteredUsers((prevUsers) => (forceLoad ? newUsers : [...prevUsers, ...newUsers]));

                if (!forceLoad) {
                    setPage((prev) => prev + 1); // Increment page only if not forcing reload
                }
            })
            .catch((err) => console.error("Failed to load users:", err))
            .finally(() => {
                setLoading(false);
                setLoadingAnimation(false);
            });
    };


    const handleSearch = (query: string) => {
        setPage(1);
        setHasMore(true);

        const filteredResults = users.filter((user) => {
            return user.firstName.toLowerCase().includes(query.toLowerCase()) ||
                user.lastName.toLowerCase().includes(query.toLowerCase()) ||
                user.userName.toLowerCase().includes(query.toLowerCase());
        });

        setFilteredUsers(filteredResults);
    };

    const handleDeleteUser = (user: User) => {
        setLoadingAnimation(true);
        if (user.id === undefined || userName === null) {
            setLoadingAnimation(false);
            return false;
        }
        deleteUser(user.id, {currentUser: userName})
            .then((res) => {
                resetPaginationAndReload();
                if (res) {
                    showToast("User \"" + user.userName + "\" deleted successfully.", "success")
                } else {
                    showToast("Error deleting user: \"" + user.userName + "\"", "error")
                }
            })
            .catch((error) => {
                console.error("Failed to delete user:", error);
            })
            .finally(() => setLoadingAnimation(false));
    };

    const handleEditUser = (user: User) => {
        setSelectedUserForOp(user);
        setEditModalOpen(true);
    };

    const handleShowUser = (user: User) => {
        setSelectedUserForOp(user);
        setViewModalOpen(true);
    }

    const handleSaveEdit = (updatedUser: User) => {
        setLoadingAnimation(true);
        updateUser({user: updatedUser, currentUser: userName})
            .then((res) => {
                if (res) {
                    const tempUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
                    setUsers(tempUsers);
                    setFilteredUsers((prev) =>
                        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
                    );
                    showToast("User \"" + res.userName + "\" updated successfully.", "success")
                } else {
                    showToast("Error updating user \"" + updatedUser.userName + "\"", "error")
                }
            })
            .finally(() => {
                setLoadingAnimation(false);
            })
    };

    const resetPaginationAndReload = () => {
        setPage(1);
        setHasMore(true);
        setUsers([]); // Clear the list of PDFs
        loadUsers(true); // Force reload starting from page 1
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

    const handleAddUser = () => {
        setAddUser(true);
    }

    const handleUserRegistration = (user: User) => {
        setLoadingAnimation(true);
        if (userName === null) {
            showToast("Error adding user \"" + user.userName + "\"", "error");
            return;
        }
        add({currentUser: userName, user: user}).then((success) => {
                resetPaginationAndReload();
                if (success) {
                    showToast("user \"" + user.userName + "\" added successfully.", "success");
                } else {
                    showToast("Error adding user \"" + user.userName + "\"", "error");
                }
            }
        ).finally(() => setLoadingAnimation(false))
    }

    const handleManageUser = () => {
        resetPaginationAndReload();
    }

    const handleMangePreferences = () => {
        navigate(MANAGE_PREFERENCES_ROUTE);
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
                onManagePreferences={handleMangePreferences}
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
                            onAddOperation={handleAddUser}
                        />
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
                            <UserList
                                users={filteredUsers}
                                onLoadMore={loadUsers}
                                onDelete={handleDeleteUser}
                                onEdit={handleEditUser}
                                onShowUser={handleShowUser}
                                isAddUser={isAddUser}
                                setIsAddUser={() => setAddUser(false)}
                                handleUserRegistration={handleUserRegistration}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <UserModal
                open={isViewModalOpen}
                user={selectedUserForOp}
                onClose={() => setViewModalOpen(false)}
                mode="view"
            />

            <UserModal
                open={isEditModalOpen}
                user={selectedUserForOp}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveEdit}
                mode="edit"
            />
        </Box>
    );
};

export default CloudUserManagement;

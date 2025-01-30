import React, {useCallback, useEffect, useState} from "react";
import {Box, CssBaseline, Grid, Toolbar, useMediaQuery} from "@mui/material";
import AppBarHeader from "../../shared/components/AppBarHeader.tsx";
import CloudDrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../../shared/store/store.ts";
import {add, deleteUser, getAllUsers, updateUser} from "../../shared/server/api/userApi.ts";
import {getUserTypeFromStr, User} from "../models/models.ts";
import {useTheme} from "@mui/material/styles";
import SearchBar from "../components/general/SearchBar.tsx";
import UserList from "../components/user/UserList.tsx";
import UserModal from "../components/user/UserModal.tsx";
import {useLoading} from "../../shared/utils/loading/useLoading.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {getDrawerPinnedState, getUserName, getUserType} from "../../shared/utils/AppState.ts";
import {CLOUD_LOGIN_ROUTE, CLOUD_MANAGE_PREFERENCES_ROUTE, CLOUD_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {drawerWidth} from "../../shared/utils/constants.ts";
import {pinDrawer, toggleDrawer} from "../components/sharedLogic.ts";

const CloudUserManagement: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
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

    const loadUsers = useCallback(
        (forceLoad: boolean = false) => {
            if (!forceLoad && (loading || !hasMore)) return;
            setLoading(true);
            setLoadingAnimation(true);

            const currentPage = forceLoad ? 1 : page;

            getAllUsers({currentUser: userName}, currentPage, 20)
                .then((newUsers) => {
                    if (newUsers.length < 20) {
                        setHasMore(false);
                    }

                    setUsers((prevUsers) =>
                        forceLoad ? newUsers : [...prevUsers, ...newUsers]
                    );
                    setFilteredUsers((prevUsers) =>
                        forceLoad ? newUsers : [...prevUsers, ...newUsers]
                    );

                    if (!forceLoad) {
                        setPage((prev) => prev + 1);
                    }
                })
                .catch((err) => console.error("Failed to load users:", err))
                .finally(() => {
                    setLoading(false);
                    setLoadingAnimation(false);
                });
        },
        [loading, hasMore, page, userName, setLoading, setLoadingAnimation, setHasMore, setUsers,
            setFilteredUsers, setPage,]
    );

    useEffect(() => {
        if (!isLoggedIn) {
            setUsers([]);
            setFilteredUsers([]);
            navigate(CLOUD_LOGIN_ROUTE);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
                    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
                    setUsers(updatedUsers);
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
        setUsers([]);
        loadUsers(true);
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
        navigate(CLOUD_MANAGE_PREFERENCES_ROUTE);
    }

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
                onManagePreferences={handleMangePreferences}
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

                <Grid container spacing={2} sx={{height: "100%"}}>
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

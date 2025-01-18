import React, {useEffect, useState} from "react";
import {Box, CssBaseline, Grid, Paper, Toolbar, useMediaQuery} from "@mui/material";
import AppBarHeader from "../components/general/AppBarHeader.tsx";
import DrawerMenu from "../components/general/DrawerMenu.tsx";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../store/store.ts";
import PDFSearchBar from "../components/pdf/PDFSearchBar.tsx";
import PdfList from "../components/pdf/PdfList.tsx";
import ExtendedPdfInfo from "../components/pdf/ExtendedPdfInfo.tsx";
import {getUserTypeFromStr, PdfFile} from "../models/models.ts";
import {deletePdf, getAllPdfs, updatePdf, uploadPdf} from "../server/api/pdfFileApi.ts";
import EditPdfModal from "../components/pdf/EditPdfModal.tsx";
import PdfGallery from "../components/pdf/PdfGallery.tsx";
import {useTheme} from "@mui/material/styles";
import {formatDate, loadPreferences} from "../utils/utilities.ts";
import {useLoading} from "../utils/LoadingContext.tsx";
import {useToast} from "../utils/ToastContext.tsx";
import {getDrawerPinnedState, getUserId, getUserName, getUserType, setDrawerPinnedState} from "../utils/AppState.ts";
import {updatePreference} from "../server/api/preferencesApi.ts";
import {LOGIN_ROUTE, MANAGE_PREFERENCES_ROUTE, MANAGE_USERS_ROUTE} from "../../shared/utils/reactRoutes.ts";
import {DRAWER_PIN_STR} from "../utils/constants.ts";

const drawerWidth = 240;

const CloudHomePage: React.FC = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md")); // Adjusts for "md" (desktop screens and above)
    const [drawerPinned, setDrawerPinned] = useState(isDesktop && getDrawerPinnedState());
    const [drawerOpen, setDrawerOpen] = useState(drawerPinned);
    const [pdfs, setPdfs] = useState<PdfFile[]>([]);
    const [filteredPdfs, setFilteredPdfs] = useState<PdfFile[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedPdfForEdit, setSelectedPdfForEdit] = useState<PdfFile | null>(null);
    const [allLabels, setAllLabels] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');
    const {setLoadingAnimation} = useLoading();
    const {showToast} = useToast();

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userType = getUserTypeFromStr(getUserType());
    const userName = getUserName();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setPdfs([]);
            setFilteredPdfs([]);
            navigate(LOGIN_ROUTE);
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadPdfs();
    }, []);

    useEffect(() => {
        loadPreferences(getUserName(), getUserId());
    }, []);

    useEffect(() => {
        updateLabels(pdfs);
    }, [pdfs]);

    const loadPdfs = (forceLoad: boolean = false) => {
        if (!forceLoad && (loading || !hasMore)) return;
        setLoading(true);
        setLoadingAnimation(true)
        const currentPage = forceLoad ? 1 : page;

        getAllPdfs({currentUser: userName}, currentPage, 20)
            .then((newPdfs) => {
                if (newPdfs.length < 20) {
                    setHasMore(false);
                }

                // If forceLoad is true, replace PDFs; otherwise, append
                setPdfs((prevPdfs) => (forceLoad ? newPdfs : [...prevPdfs, ...newPdfs]));
                setFilteredPdfs((prevPdfs) => (forceLoad ? newPdfs : [...prevPdfs, ...newPdfs]));

                if (!forceLoad) {
                    setPage((prev) => prev + 1); // Increment page only if not forcing reload
                }
            })
            .catch((err) => console.error("Failed to load PDFs:", err))
            .finally(() => {
                setLoading(false);
                setLoadingAnimation(false);
            });
    };


    const handleSearch = (query: string, labels: string[]) => {
        setPage(1);
        setHasMore(true);

        const filteredResults = pdfs.filter((pdf) => {
            const matchesQuery =
                !query ||
                pdf.fileName.toLowerCase().includes(query.toLowerCase()) ||
                formatDate(pdf.uploadedAt).toLowerCase().includes(query.toLowerCase()) ||
                pdf.description?.toLowerCase().includes(query.toLowerCase()) ||
                pdf.uploadedBy.toLowerCase().includes(query.toLowerCase()) ||
                pdf.labels.some((label) =>
                    label.toLowerCase().includes(query.toLowerCase())
                );
            const matchesLabels =
                labels.length === 0 ||
                labels.every((selectedLabel) => pdf.labels.includes(selectedLabel));

            return matchesQuery && matchesLabels;
        });

        setFilteredPdfs(filteredResults);
    };

    const handleFileUpload = (file: File) => {
        setLoadingAnimation(true);
        if (userName === null) {
            showToast("Error uploading PDF \"" + file.name + "\"", "error");
            return;
        }
        uploadPdf(file, userName).then((newPdf) => {
            if (newPdf !== undefined) {
                // Reset pagination and reload PDFs
                resetPaginationAndReload();
                showToast("Successfully uploaded PDF \"" + newPdf.fileName + "\"", "success");
            } else {
                showToast("Error uploading PDF \"" + file.name + "\"", "error");
            }
        }).finally(() => {
            setLoading(false);
            setLoadingAnimation(false);
        });
    };

    const handleDeletePdf = (pdf: PdfFile) => {
        setLoadingAnimation(true);
        if (userName === null) {
            showToast("Error deleting PDF \"" + pdf.fileName + "\"", "error");
            return;
        }
        deletePdf(pdf.id, {currentUser: userName})
            .then((res) => {
                if (res === 200) {
                    showToast("PDF \"" + pdf.fileName + "\" deleted successfully.", "success");
                } else if (res === 401) {
                    showToast("Current user can't delete PDF \"" + pdf.fileName + "\"", "error")
                } else {
                    showToast("Error deleting PDF \"" + pdf.fileName + "\"", "error")
                }
                // Reset pagination and reload PDFs
                resetPaginationAndReload();
                setSelectedPdf(null);
            })
            .catch(() => {
                showToast("Error deleting PDF \"" + pdf.fileName + "\"", "error");
            }).finally(() => setLoadingAnimation(false));
    };

    const resetPaginationAndReload = () => {
        setPage(1);
        setHasMore(true);
        setPdfs([]); // Clear the list of PDFs
        loadPdfs(true); // Force reload starting from page 1
    };

    const handleRowClick = (pdfFile: PdfFile) => {
        setSelectedPdf(pdfFile);
    };

    const handleRegisterUser = () => {
        navigate(MANAGE_USERS_ROUTE)
    };

    const handleMangePreferences = () => {
        navigate(MANAGE_PREFERENCES_ROUTE)
    }

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

    const handleEditPdf = (pdf: PdfFile) => {
        setSelectedPdfForEdit(pdf);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (updatedPdf: PdfFile) => {
        setLoadingAnimation(true);
        updatePdf({currentUser: userName, pdfFile: updatedPdf}).then((res) => {
            if (res && res.id === updatedPdf.id) {
                setSelectedPdf(res);
                const tempPdfs = pdfs.map((pdf) => (pdf.id === updatedPdf.id ? updatedPdf : pdf));
                setPdfs(tempPdfs);
                setFilteredPdfs((prev) =>
                    prev.map((pdf) => (pdf.id === updatedPdf.id ? updatedPdf : pdf))
                );
                updateLabels(tempPdfs)
                showToast("PDF \"" + res.fileName + "\" updated successfully.", "success");
            } else {
                showToast("Error updating PDF \"" + updatedPdf.fileName + "\"", "error");
            }
        }).finally(() => {
            setLoading(false);
            setLoadingAnimation(false);
        });
    };

    const updateLabels = (pdfs: PdfFile[]) => {
        // Extract unique labels
        const labels = Array.from(new Set(pdfs.flatMap((pdf) => pdf.labels || [])));
        setAllLabels(labels);
    }

    const handleViewToggle = (_event: React.MouseEvent<HTMLElement>, newView: 'list' | 'gallery') => {
        if (newView !== null) setViewMode(newView);
    };

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
                onManageUser={handleRegisterUser}
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
                        <PDFSearchBar
                            onSearch={handleSearch}
                            onFileUpload={handleFileUpload}
                            viewMode={viewMode}
                            handleViewToggle={handleViewToggle}
                            availableLabels={allLabels}
                        />
                        <Box sx={{flexGrow: 1, overflow: "hidden", height: "100%"}}>
                            {viewMode === "list" ? (
                                <PdfList
                                    pdfs={filteredPdfs}
                                    onRowClick={handleRowClick}
                                    onLoadMore={loadPdfs}
                                    onDelete={handleDeletePdf}
                                    onEdit={handleEditPdf}
                                />
                            ) : (
                                <PdfGallery
                                    pdfs={filteredPdfs}
                                    onRowClick={handleRowClick}
                                    onLoadMore={loadPdfs}
                                    onDelete={handleDeletePdf}
                                    onEdit={handleEditPdf}
                                />
                            )}

                            <EditPdfModal
                                open={isEditModalOpen}
                                pdf={selectedPdfForEdit}
                                onClose={() => setEditModalOpen(false)}
                                onSave={handleSaveEdit}
                                allLabels={allLabels}
                            />
                        </Box>
                    </Grid>

                    {/* Right Section: Extended PDF Info (Only on Desktop) */}
                    {isDesktop && (
                        <Grid item md={4} sx={{height: "100%"}}>
                            {selectedPdf ? (
                                <ExtendedPdfInfo
                                    name={selectedPdf.fileName}
                                    size={selectedPdf.size}
                                    uploadedAt={selectedPdf.uploadedAt}
                                    labels={selectedPdf.labels}
                                    description={selectedPdf.description || ""}
                                />
                            ) : (
                                <Paper
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        boxShadow: 3,
                                    }}
                                    elevation={3}
                                >
                                    Select a PDF to view details here.
                                </Paper>
                            )}
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    );
};

export default CloudHomePage;

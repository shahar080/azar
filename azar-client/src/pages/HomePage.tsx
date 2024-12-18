import React, {useEffect, useState} from "react";
import {Box, CssBaseline, Grid, Paper, Toolbar} from "@mui/material";
import AppBarHeader from "../components/AppBarHeader";
import DrawerMenu from "../components/DrawerMenu";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {RootState} from "../store/store";
import RegisterUserModal from "../components/RegisterUserModal";
import SearchBar from "../components/SearchBar";
import PdfList from "../components/PdfList";
import ExtendedPdfInfo from "../components/ExtendedPdfInfo";
import {add} from "../server/api/userApi";
import {PdfFile, User} from "../models/models";
import {deletePdf, getAllPdfs, updatePdf, uploadPdf} from "../server/api/pdfFileApi.ts";
import EditPdfModal from "../components/EditPdfModal.tsx";
import PdfGallery from "../components/PdfGallery.tsx";

const drawerWidth = 240;

const HomePage: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPinned, setDrawerPinned] = useState(true);
    const [isRegisterUserModalOpen, setRegisterUserModalOpen] = useState(false);
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

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = useSelector((state: RootState) => state.auth.username);
    const userType = useSelector((state: RootState) => state.auth.userType);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setPdfs([]);
            setFilteredPdfs([]);
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        loadPdfs();
    }, []);

    const loadPdfs = (forceLoad: boolean = false) => {
        if (!forceLoad && (loading || !hasMore)) return; // Stop if already loading or no more PDFs
        setLoading(true);

        getAllPdfs(page, 20)
            .then((newPdfs) => {
                if (newPdfs.length < 20) {
                    setHasMore(false);
                }

                // Avoid duplicate entries
                const uniquePdfs = [
                    ...pdfs,
                    ...newPdfs.filter(
                        (newPdf) => !pdfs.some((existingPdf) => existingPdf.id === newPdf.id)
                    ),
                ];

                setPdfs(uniquePdfs);         // Update state
                setFilteredPdfs(uniquePdfs); // Update filtered list
                setPage((prev) => prev + 1); // Increment page number
                updateLabels(uniquePdfs)
            })
            .catch((err) => console.error("Failed to load more PDFs", err))
            .finally(() => setLoading(false));
    };

    const handleSearch = (query: string, labels: string[]) => {
        setPage(1);
        setHasMore(true);

        const filteredResults = pdfs.filter((pdf) => {
            const matchesQuery =
                !query ||
                pdf.fileName.toLowerCase().includes(query.toLowerCase()) ||
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
        uploadPdf(file).then((newPdf) => {
            if (newPdf !== undefined) {
                // Reset pagination
                setPage(1);
                setHasMore(true);
                // Reload PDFs from the first page
                loadPdfs(true);

                console.log("File uploaded successfully:", newPdf);
            } else {
                console.error("File upload failed.");
            }
        });
    };

    const handleDeletePdf = (pdfId: string) => {
        // Make an API call to delete the PDF
        deletePdf(pdfId).then(() => {
            setPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfId));
            setFilteredPdfs((prevPdfs) => prevPdfs.filter((pdf) => pdf.id !== pdfId));
        }).catch((error) => {
            console.error("Failed to delete PDF:", error);
        });
    };

    const handleRowClick = (pdfFile: PdfFile) => {
        setSelectedPdf(pdfFile);
    };

    const handleRegisterUser = () => {
        setRegisterUserModalOpen(true);
    };

    const handleUserRegistration = (userToAdd: User) => {
        add(userName, userToAdd);
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

    const handleEditPdf = (pdf: PdfFile) => {
        setSelectedPdfForEdit(pdf);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (updatedPdf: PdfFile) => {
        // Replace the edited PDF in the list
        const tempPdfs = pdfs.map((pdf) => (pdf.id === updatedPdf.id ? updatedPdf : pdf));
        setPdfs(tempPdfs);
        setFilteredPdfs((prev) =>
            prev.map((pdf) => (pdf.id === updatedPdf.id ? updatedPdf : pdf))
        );
        updateLabels(tempPdfs)
        // Optionally, send an API call to save changes on the server
        updatePdf(updatedPdf);
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
                onRegisterUser={handleRegisterUser}
                onClose={() => setDrawerOpen(false)}
                userType={userType}
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    width: drawerPinned ? `calc(100% - ${drawerWidth}px)` : '100%',
                    transition: 'margin-left 0.3s ease, width 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Ensures AppBar Offset */}
                <Toolbar/>

                {/* Grid Layout */}
                <Grid container spacing={2} sx={{height: '100%'}}>
                    {/* Left Section: Search and PDF Table */}
                    <Grid item xs={8} sx={{display: "flex", flexDirection: "column", gap: 2, height: "100%"}}>
                        <SearchBar
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
                                    onEdit={handleEditPdf}/>
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

                    {/* Right Section: Extended PDF Info */}
                    <Grid item xs={4} sx={{height: '100%'}}>
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
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: 3,
                                }}
                                elevation={3}
                            >
                                Select a PDF to view details here.
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Register User Modal */}
            <RegisterUserModal
                open={isRegisterUserModalOpen}
                onClose={() => setRegisterUserModalOpen(false)}
                onSubmit={handleUserRegistration}
            />
        </Box>
    );
};

export default HomePage;

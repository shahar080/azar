import React, {useEffect, useState} from 'react';
import {Box, CssBaseline, Grid, Paper, Toolbar,} from '@mui/material';
import AppBarHeader from '../components/AppBarHeader';
import DrawerMenu from '../components/DrawerMenu';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {RootState} from '../store/store';
import RegisterUserModal from "../components/RegisterUserModal";
import SearchBar from "../components/SearchBar";
import PdfList from "../components/PdfList";
import ExtendedPdfInfo from "../components/ExtendedPdfInfo";
import {add} from "../server/api/userApi";
import {User} from "../models/models";

interface Pdf {
    id: number;
    name: string;
    size: string;
    uploadedAt: string;
    labels: string[];
    description?: string;
}

const drawerWidth = 240;

const HomePage: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPinned, setDrawerPinned] = useState(true);
    const [isRegisterUserModalOpen, setRegisterUserModalOpen] = useState(false);
    const [pdfs, setPdfs] = useState<Pdf[]>([
        {
            id: 1,
            name: "Report.pdf",
            size: "2 MB",
            uploadedAt: "2024-12-01",
            labels: ["work", "finance"],
            description: "Detailed financial report for Q4."
        },
        {
            id: 2,
            name: "Resume.pdf",
            size: "1 MB",
            uploadedAt: "2024-12-05",
            labels: ["personal"],
            description: "John Doe's professional resume."
        },
    ]);
    const [filteredPdfs, setFilteredPdfs] = useState<Pdf[]>(pdfs);
    const [selectedPdf, setSelectedPdf] = useState<Pdf | null>(null);

    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const userName = useSelector((state: RootState) => state.auth.username);
    const userType = useSelector((state: RootState) => state.auth.userType);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const handleSearch = (query: string, labels: string[]) => {
        setFilteredPdfs(
            pdfs.filter((pdf) =>
                pdf.name.toLowerCase().includes(query.toLowerCase()) &&
                (labels.length === 0 || labels.every((label) => pdf.labels.includes(label)))
            )
        );
    };

    const handleFileUpload = (file: File) => {
        const newPdf: Pdf = {
            id: pdfs.length + 1,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            uploadedAt: new Date().toISOString().split('T')[0],
            labels: ['uploaded'],
            description: "No description available.",
        };
        setPdfs([...pdfs, newPdf]);
        setFilteredPdfs([...pdfs, newPdf]);
    };

    const handleRowClick = (pdf: Pdf) => {
        setSelectedPdf(pdf);
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
                    <Grid item xs={8} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <SearchBar
                            onSearch={handleSearch}
                            onFileUpload={handleFileUpload}
                            availableLabels={[...new Set(pdfs.flatMap((pdf) => pdf.labels))]}
                        />
                        <Box sx={{flexGrow: 1, overflowY: 'auto'}}>
                            <PdfList pdfs={filteredPdfs} onRowClick={handleRowClick}/>
                        </Box>
                    </Grid>

                    {/* Right Section: Extended PDF Info */}
                    <Grid item xs={4} sx={{height: '100%'}}>
                        {selectedPdf ? (
                            <ExtendedPdfInfo
                                name={selectedPdf.name}
                                size={selectedPdf.size}
                                uploadedAt={selectedPdf.uploadedAt}
                                labels={selectedPdf.labels}
                                description={selectedPdf.description || "No description available"}
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

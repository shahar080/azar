import React, {useEffect, useState} from 'react';
import {Box, CssBaseline, Toolbar, Typography} from '@mui/material';
import AppBarHeader from '../components/AppBarHeader';
import DrawerMenu from '../components/DrawerMenu';
import {useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {RootState} from '../store/store';

const drawerWidth = 240;

const HomePage: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPinned, setDrawerPinned] = useState(false);
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login'); // Redirect to login if not logged in
        }
    }, [isLoggedIn, navigate]);

    const toggleDrawer = () => {
        if (drawerPinned) return;
        setDrawerOpen(!drawerOpen);
    };

    const pinDrawer = () => {
        setDrawerPinned(!drawerPinned);
        setDrawerOpen(!drawerPinned); // Keep it open when pinned
    };

    const navigateTo = (path: string) => {
        console.log(`Navigate to: ${path}`);
        // Add routing logic here
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            {/* AppBar */}
            <AppBarHeader onMenuToggle={toggleDrawer} onLogoClick={() => navigateTo('/')}/>

            {/* Drawer */}
            <DrawerMenu
                open={drawerOpen}
                pinned={drawerPinned}
                onPinToggle={pinDrawer}
                onNavigate={navigateTo}
                onClose={() => setDrawerOpen(false)}
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    padding: 3,
                    marginLeft: drawerPinned ? `${drawerWidth}px` : 0,
                    transition: 'margin-left 0.3s',
                }}
            >
                <Toolbar/>
                <Typography variant="h4">Welcome to the Home Page</Typography>
                <Typography>This is your home page content.</Typography>
            </Box>
        </Box>
    );
};

export default HomePage;

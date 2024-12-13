import React from 'react';
import {AppBar, IconButton, Toolbar, Typography} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface AppBarHeaderProps {
    onMenuToggle: () => void;
    onLogoClick: () => void;
}

const AppBarHeader: React.FC<AppBarHeaderProps> = ({onMenuToggle, onLogoClick}) => {
    return (
        <AppBar position="fixed" sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
            <Toolbar>
                <IconButton edge="start" color="inherit" onClick={onMenuToggle} sx={{mr: 2}}>
                    <MenuIcon/>
                </IconButton>
                <Typography variant="h6" sx={{flexGrow: 1}}>
                    My Website
                </Typography>
                <img
                    src="/path-to-your-logo.png"
                    alt="Logo"
                    style={{height: 40, cursor: 'pointer'}}
                    onClick={onLogoClick}
                />
            </Toolbar>
        </AppBar>
    );
};

export default AppBarHeader;

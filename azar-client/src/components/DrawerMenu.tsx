import React from 'react';
import {Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {logout} from "../store/authSlice.ts";
import {useDispatch} from 'react-redux';
import {AppDispatch} from "../store/store.ts";

interface DrawerMenuProps {
    open: boolean;
    pinned: boolean;
    onPinToggle: () => void;
    onNavigate: (path: string) => void;
    onClose: () => void;
    onRegisterUser: () => void;
}

interface OnLogoutProps {
    onNavigate: (path: string) => void;
    dispatch: AppDispatch;
}

const drawerWidth = 240;

const DrawerMenu: React.FC<DrawerMenuProps> = ({open, pinned, onPinToggle, onNavigate, onClose, onRegisterUser}) => {
    const dispatch = useDispatch();
    // TODO AZAR-29
    return (
        <Drawer
            variant={pinned ? 'permanent' : 'temporary'}
            open={open || pinned}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar/>
            <List>
                <ListItem component={"div"} onClick={() => onNavigate('/option1')}>
                    <ListItemIcon>
                        <HomeIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Option1"/>
                </ListItem>
                <ListItem component={"div"} onClick={() => onNavigate('/option2')}>
                    <ListItemIcon>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Option2"/>
                </ListItem>
                <ListItem component={"div"} onClick={onRegisterUser}>
                    <ListItemIcon>
                        <PersonAddIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Add User"/>
                </ListItem>
                <ListItem component={"div"} onClick={() => handleLogOut({onNavigate, dispatch})}>
                    <ListItemIcon>
                        <LogoutIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Logout"/>
                </ListItem>
                <ListItem component={"div"} onClick={onPinToggle}>
                    <ListItemIcon>
                        <MenuIcon/>
                    </ListItemIcon>
                    <ListItemText primary={pinned ? 'Unpin Drawer' : 'Pin Drawer'}/>
                </ListItem>
            </List>
        </Drawer>
    );
};

function handleLogOut({onNavigate, dispatch}: OnLogoutProps): void {
    dispatch(logout());
    localStorage.removeItem('authToken');
    onNavigate('/login');
}

export default DrawerMenu;
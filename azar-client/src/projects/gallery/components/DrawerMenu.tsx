import React from 'react';
import {ButtonBase, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import {useDispatch} from 'react-redux';
import {AppDispatch} from "../../shared/store/store.ts";
import {logout} from "../../shared/store/authSlice.ts";
import {GALLERY_ROUTE} from '../../shared/utils/reactRoutes.ts';
import {clearCredentials} from "../../shared/utils/utilities.ts";
import {drawerWidth} from "../../shared/utils/constants.ts";
import {useNavigate} from "react-router-dom";
import {Collections} from "@mui/icons-material";

interface DrawerMenuProps {
    onManagePhotos: () => void;
}

interface OnLogoutProps {
    navigate: (path: string) => void;
    dispatch: AppDispatch;
}

const GalleryDrawerMenu: React.FC<DrawerMenuProps> = ({
                                                          onManagePhotos,
                                                      }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const hoverStyles = {
        "&:hover": {
            backgroundColor: "action.hover",
        },
    };

    return (
        <Drawer
            variant={'permanent'}
            onClose={() => {
            }}
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
                <ListItem component={ButtonBase} onClick={onManagePhotos} sx={hoverStyles}>
                    <ListItemIcon>
                        <Collections/>
                    </ListItemIcon>
                    <ListItemText primary="Manage Photos"/>
                </ListItem>
                <ListItem component={ButtonBase} onClick={() => handleLogOut({navigate, dispatch})} sx={hoverStyles}>
                    <ListItemIcon>
                        <LogoutIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Logout"/>
                </ListItem>
            </List>
        </Drawer>
    );
};

function handleLogOut({navigate, dispatch}: OnLogoutProps): void {
    dispatch(logout());
    clearCredentials();
    navigate(GALLERY_ROUTE);
}

export default GalleryDrawerMenu;
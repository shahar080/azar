import React from 'react';
import {ButtonBase, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import {useDispatch} from 'react-redux';
import {AppDispatch} from "../../shared/store/store.ts";
import {logout} from "../../shared/store/authSlice.ts";
import {LANDING_ROUTE} from '../../shared/utils/reactRoutes.ts';
import {clearCredentials} from "../../shared/utils/utilities.ts";
import {drawerWidth} from "../../shared/utils/constants.ts";
import {useNavigate} from "react-router-dom";

interface DrawerMenuProps {
    onManageCV: () => void;
    onManageWhoAmI: () => void;
    onManageEmail: () => void;
}

interface OnLogoutProps {
    navigate: (path: string) => void;
    dispatch: AppDispatch;
}

const WhoAmIDrawerMenu: React.FC<DrawerMenuProps> = ({
                                                         onManageCV,
                                                         onManageWhoAmI,
                                                         onManageEmail,
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
                <ListItem component={ButtonBase} onClick={onManageCV} sx={hoverStyles}>
                    <ListItemIcon>
                        <ContactPageIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Manage CV"/>
                </ListItem>
                <ListItem component={ButtonBase} onClick={onManageWhoAmI} sx={hoverStyles}>
                    <ListItemIcon>
                        <InfoIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Manage WhoAmI"/>
                </ListItem>
                <ListItem component={ButtonBase} onClick={onManageEmail} sx={hoverStyles}>
                    <ListItemIcon>
                        <EmailIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Manage Email"/>
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
    navigate(LANDING_ROUTE);
}

export default WhoAmIDrawerMenu;
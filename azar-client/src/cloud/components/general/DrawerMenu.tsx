import React from 'react';
import {ButtonBase, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, useMediaQuery} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import {logout} from "../../../shared/store/authSlice.ts";
import {useDispatch} from 'react-redux';
import {AppDispatch} from "../../../shared/store/store.ts";
import {UserType} from "../../models/models.ts";
import {useTheme} from "@mui/material/styles";
import {useNavigate} from "react-router-dom";
import {CLOUD_LOGIN_ROUTE, CLOUD_ROUTE} from '../../../shared/utils/reactRoutes.ts';
import {clearCredentials} from "../../../shared/utils/utilities.ts";
import {drawerWidth} from "../../../shared/utils/constants.ts";

interface DrawerMenuProps {
    open: boolean;
    pinned: boolean;
    onPinToggle: () => void;
    onClose: () => void;
    onManageUser: () => void;
    onManagePreferences: () => void;
    userType: UserType;
}

interface OnLogoutProps {
    navigate: (path: string) => void;
    dispatch: AppDispatch;
}

const CloudDrawerMenu: React.FC<DrawerMenuProps> = ({
                                                   open,
                                                   pinned,
                                                   onPinToggle,
                                                   onClose,
                                                   onManageUser,
                                                   onManagePreferences,
                                                   userType = UserType.STANDARD,
                                               }) => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const hoverStyles = {
        "&:hover": {
            backgroundColor: "action.hover",
        },
    };

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
                <ListItem component={ButtonBase} onClick={() => navigate(CLOUD_ROUTE)} sx={hoverStyles}>
                    <ListItemIcon>
                        <HomeIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Home"/>
                </ListItem>
                {userType === UserType.ADMIN &&
                    <ListItem component={ButtonBase} onClick={onManageUser} sx={hoverStyles}>
                        <ListItemIcon>
                            <PeopleIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Users"/>
                    </ListItem>
                }
                <ListItem component={ButtonBase} onClick={onManagePreferences} sx={hoverStyles}>
                    <ListItemIcon>
                        <SettingsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Preferences"/>
                </ListItem>
                <ListItem component={ButtonBase} onClick={() => handleLogOut({navigate, dispatch})} sx={hoverStyles}>
                    <ListItemIcon>
                        <LogoutIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Logout"/>
                </ListItem>
                {isDesktop &&
                    <ListItem component={ButtonBase} onClick={onPinToggle} sx={hoverStyles}>
                        <ListItemIcon>
                            {pinned ? <PushPinIcon/> : <PushPinOutlinedIcon/>}
                        </ListItemIcon>
                        <ListItemText primary={pinned ? 'Unpin Drawer' : 'Pin Drawer'}/>
                    </ListItem>
                }
            </List>
        </Drawer>
    );
};

function handleLogOut({navigate, dispatch}: OnLogoutProps): void {
    dispatch(logout());
    clearCredentials();
    navigate(CLOUD_LOGIN_ROUTE);
}

export default CloudDrawerMenu;
import React, { useState, useMemo } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    AppBar,
    Toolbar,
    Paper,
    Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BlockIcon from "@mui/icons-material/Block";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {getUserName} from "../../shared/utils/AppState.ts";

// Dummy Data Definitions
const DUMMY_TAGS = ['Shahar1', 'Shahar2', 'Shahar3'];

type Status = 'ACCOUNTED_FOR' | 'NOT_REPORTED' | 'NO_ALERT';

interface UserRow {
    id: string;
    name: string;
    status: Status;
}

const getStatusIcon = (status: Status) => {
    switch (status) {
        case 'ACCOUNTED_FOR':
            return <CheckCircleIcon color="success" />;
        case 'NOT_REPORTED':
            return <HelpOutlineIcon color="warning" />;
        case 'NO_ALERT':
            return <BlockIcon color="error" />;
        default:
            return <HelpOutlineIcon />;
    }
};

export const RedAlertDashboard: React.FC = () => {
    // We check either the explicit username stored in the app state, 
    // or fallback to "User" if not set but somehow authenticated.
    const username = getUserName() || "User";

    // Initialize state with dummy data, injecting the current user
    const [dashboardData, setDashboardData] = useState<Record<string, UserRow[]>>(() => {
        const initialData: Record<string, UserRow[]> = {};
        DUMMY_TAGS.forEach(tag => {
            initialData[tag] = [
                { id: `${tag}-1`, name: `${tag} row 1`, status: 'ACCOUNTED_FOR' },
                { id: `${tag}-2`, name: `${tag} row 2`, status: 'NOT_REPORTED' },
                { id: `${tag}-3`, name: `${tag} row 3`, status: 'NO_ALERT' },
            ];
        });
        // Inject current user into the first tag to demonstrate updates
        if (initialData[DUMMY_TAGS[0]]) {
            initialData[DUMMY_TAGS[0]].unshift({ id: 'current-user', name: username, status: 'NOT_REPORTED' });
        }
        return initialData;
    });

    const handleStatusUpdate = (newStatus: Status) => {
        setDashboardData(prevData => {
            const newData = { ...prevData };
            // Find current user and update their status
            for (const tag of Object.keys(newData)) {
                newData[tag] = newData[tag].map(row => 
                    row.id === 'current-user' ? { ...row, status: newStatus } : row
                );
            }
            return newData;
        });
    };

    // Calculate total reported counters dynamically based on state
    const { totalReported, totalUsers } = useMemo(() => {
        let reported = 0;
        let total = 0;
        Object.values(dashboardData).forEach(rows => {
            total += rows.length;
            reported += rows.filter(r => r.status === 'ACCOUNTED_FOR' || r.status === 'NO_ALERT').length;
        });
        return { totalReported: reported, totalUsers: total };
    }, [dashboardData]);

    // Replaced by useMemo


    return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Topbar */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <Toolbar sx={{ justifyContent: 'center' }}>
                    <Typography variant="h6" color="white" sx={{ textAlign: 'center' }}>
                        {username}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content Area */}
            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
                <Paper elevation={3} sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    p: 2
                }}>
                    <Typography variant="h5" color="white" gutterBottom sx={{ mb: 3 }}>
                        סטטוס ({totalReported}/{totalUsers})
                    </Typography>

                    {DUMMY_TAGS.map((tag) => {
                        const tagRows = dashboardData[tag];
                        const tagTotal = tagRows?.length || 0;
                        const tagReported = tagRows?.filter(r => r.status === 'ACCOUNTED_FOR' || r.status === 'NO_ALERT').length || 0;

                        return (
                        <Accordion key={tag} sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            mb: 1,
                            '&:before': { display: 'none' }, // Removes default MUI Accordion divider
                        }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                                <Typography fontWeight="bold">{tag} ({tagReported}/{tagTotal})</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                <List disablePadding>
                                    {tagRows?.map((row) => (
                                        <ListItem key={row.id} sx={{ py: 0.5, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                            <ListItemIcon sx={{ minWidth: 'auto', ml: 2, mr: 0 }}>
                                                <AccountCircleIcon sx={{ color: 'white' }} />
                                            </ListItemIcon>
                                            <ListItemText primary={row.name} primaryTypographyProps={{ color: 'white', align: 'right' }} sx={{ flexGrow: 0, ml: 2, mr: 0 }} />
                                            <ListItemIcon sx={{ minWidth: 'auto' }}>
                                                {getStatusIcon(row.status)}
                                            </ListItemIcon>
                                        </ListItem>
                                    ))}
                                </List>
                            </AccordionDetails>
                        </Accordion>
                        );
                    })}
                </Paper>
            </Box>

            {/* Bottom Action Bar */}
            <Box sx={{
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch'
            }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleStatusUpdate('ACCOUNTED_FOR')}>
                    {getStatusIcon('ACCOUNTED_FOR')}
                    <Typography variant="caption" color="white" sx={{ mt: 0.5, textAlign: 'center' }}>במרחב מוגן</Typography>
                </Box>
                
                <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.3)', mx: 2 }} />

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleStatusUpdate('NO_ALERT')}>
                    {getStatusIcon('NO_ALERT')}
                    <Typography variant="caption" color="white" sx={{ mt: 0.5, textAlign: 'center' }}>אין אצלי</Typography>
                </Box>
            </Box>
        </Box>
    );
};

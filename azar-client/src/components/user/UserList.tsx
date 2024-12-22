import React, {MouseEvent, TouchEvent, useEffect, useRef, useState} from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    useMediaQuery,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {User} from "../../models/models.ts";
import UserContextMenu from "./UserContextMenu.tsx";
import RegisterUserModal from "./RegisterUserModal.tsx";

interface UserListProps {
    users: User[];
    onLoadMore: () => void;
    onDelete: (userId: string) => void;
    onEdit: (user: User) => void;
    onShowUser: (user: User) => void;
    isAddUser: boolean;
    setIsAddUser: () => void;
    handleUserRegistration: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({
                                               users,
                                               onLoadMore,
                                               onDelete,
                                               onEdit,
                                               onShowUser,
                                               isAddUser,
                                               setIsAddUser,
                                               handleUserRegistration
                                           }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('fileName');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        const handleScroll = () => {
            const container = containerRef.current;
            if (container) {
                const bottomReached =
                    container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
                if (bottomReached) {
                    onLoadMore();
                }
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => container?.removeEventListener("scroll", handleScroll);
    }, [onLoadMore]);

    // Sorting Logic
    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortData = (array: any[]) => {
        return array.sort((a, b) => {
            const isAsc = order === 'asc';
            if (a[orderBy] < b[orderBy]) {
                return isAsc ? -1 : 1;
            }
            if (a[orderBy] > b[orderBy]) {
                return isAsc ? 1 : -1;
            }
            return 0;
        });
    };

    const sortedUsers = sortData([...users]);

    // Context Menu Logic
    const handleRightClick = (event: MouseEvent<HTMLTableRowElement>, user: User) => {
        if (!isMobile) {
            event.preventDefault();
            setAnchorPosition({top: event.clientY - 4, left: event.clientX - 2});
            setSelectedUser(user);
        }
    };

    const handleTouchStart = (event: TouchEvent<HTMLTableRowElement>, user: User) => {
        if (isMobile) {
            longPressTimer.current = setTimeout(() => {
                setAnchorPosition({
                    top: event.touches[0].clientY,
                    left: event.touches[0].clientX,
                });
                setSelectedUser(user);
            }, 600); // Long-press duration
        }
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleCloseMenu = () => {
        setAnchorPosition(null);
    };

    const handleDelete = () => {
        if (selectedUser && selectedUser.id) {
            onDelete(selectedUser.id);
        }
        handleCloseMenu();
    };

    const handleEdit = () => {
        if (selectedUser) {
            onEdit(selectedUser);
        }
        handleCloseMenu();
    };

    const handleShowUser = () => {
        if (selectedUser) {
            onShowUser(selectedUser);
        }
        handleCloseMenu();
    }

    return (
        <>
            <TableContainer
                ref={containerRef}
                component={Paper}
                sx={{
                    height: "calc(100vh - 250px)",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {width: "6px"},
                    "&::-webkit-scrollbar-thumb": {backgroundColor: "#b0b0b0", borderRadius: "10px"},
                    "&::-webkit-scrollbar-track": {backgroundColor: "transparent"},
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {['firstName', 'lastName', 'userName', 'userType'].map((field) => (
                                <TableCell key={field} sortDirection={orderBy === field ? order : false}>
                                    <TableSortLabel
                                        active={orderBy === field}
                                        direction={orderBy === field ? order : 'asc'}
                                        onClick={() => handleRequestSort(field)}
                                    >
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.map((user: User) => (
                            <TableRow
                                key={user.id}
                                hover
                                onContextMenu={(e) => handleRightClick(e, user)}
                                onTouchStart={(e) => handleTouchStart(e, user)}
                                onTouchEnd={handleTouchEnd}
                                sx={{
                                    cursor: "pointer",
                                    userSelect: "none",              // Prevents text selection
                                    WebkitTouchCallout: "none",     // Disables iOS native menu
                                    WebkitUserSelect: "none",       // Prevents Safari text selection
                                    MozUserSelect: "none",          // Prevents Firefox text selection
                                    msUserSelect: "none",           // Prevents IE/Edge text selection
                                }}
                            >
                                <TableCell>{user.firstName}</TableCell>
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.userName}</TableCell>
                                <TableCell>{user.userType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <UserContextMenu
                anchorPosition={anchorPosition}
                user={selectedUser}
                onClose={handleCloseMenu}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShowUser={handleShowUser}
            />

            <RegisterUserModal
                open={isAddUser}
                onClose={setIsAddUser}
                onSubmit={handleUserRegistration}
            />
        </>
    );
};

export default UserList;

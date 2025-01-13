import React, {useEffect, useState} from "react";
import {Box, Button, MenuItem, Modal, Stack, TextField, Typography} from "@mui/material";
import {getUserTypeFromStr, User, UserType} from "../../models/models.ts";
import {AccountCircle, Person} from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";

interface UserModalProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
    onSave?: (updatedUser: User) => void; // Optional, only used in edit mode
    mode: "view" | "edit"; // Determines whether the modal is for viewing or editing
}

const UserModal: React.FC<UserModalProps> = ({open, user, onClose, onSave, mode}) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [userType, setUserType] = useState(UserType.STANDARD);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setUserName(user.userName || "");
            setUserType(getUserTypeFromStr(user.userType) || UserType.STANDARD);
        }
    }, [user]);

    const handleSave = () => {
        if (onSave && user) {
            onSave({
                ...user,
                firstName,
                lastName,
                userName,
                userType,
            });
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" mb={2}>
                    {mode === "view" ? "View User" : "Edit User"}
                </Typography>

                {/* First Name Field */}
                <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    margin="dense"
                    disabled={mode === "view"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person/>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Last Name Field */}
                <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    margin="dense"
                    disabled={mode === "view"}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Person/>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Username Field */}
                <TextField
                    fullWidth
                    label="Username"
                    value={userName}
                    margin="dense"
                    disabled
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountCircle/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    label="User Type"
                    name="userType"
                    value={userType}
                    select
                    fullWidth
                    margin="normal"
                    onChange={(e) => setUserType(getUserTypeFromStr(e.target.value))}
                    disabled={mode === "view"}
                >
                    {Object.values(UserType).map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                {/* Actions */}
                <Stack direction="row" spacing={2} mt={2}>
                    {mode === "edit" && (
                        <Button variant="outlined" onClick={handleSave}>
                            Save
                        </Button>
                    )}
                    <Button variant="outlined" onClick={onClose}>
                        {mode === "view" ? "Close" : "Cancel"}
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
};

export default UserModal;

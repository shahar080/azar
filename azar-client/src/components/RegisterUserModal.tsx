import React, {useState} from 'react';
import {Box, Button, Modal, TextField, Typography,} from '@mui/material';
import {User} from "../models/models.ts";
import PasswordField from "./PasswordField.tsx";

interface RegisterUserModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: User) => void;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({open, onClose, onSubmit}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userName: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        userName: false,
        password: false,
        confirmPassword: false,
    });

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            userName: '',
            password: '',
            confirmPassword: '',
        });
        setErrors({
            firstName: false,
            lastName: false,
            userName: false,
            password: false,
            confirmPassword: false,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const validateForm = () => {
        const newErrors = {
            firstName: !formData.firstName.trim(),
            lastName: !formData.lastName.trim(),
            userName: !formData.userName.trim(),
            password: !formData.password.trim(),
            confirmPassword: formData.password !== formData.confirmPassword || !formData.confirmPassword.trim(),
        };
        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const {firstName, lastName, userName, password} = formData;
            onSubmit({firstName, lastName, userName, password, userType: "STANDARD"}); // TODO AZAR-28
            resetForm(); // Clear the form after successful submission
            onClose();   // Close the modal
        }
    };

    const handleCancel = () => {
        resetForm();  // Reset form on cancel
        onClose();    // Close the modal
    };

    return (
        <Modal open={open} onClose={handleCancel}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <Typography variant="h6" component="h2" mb={2}>
                    Register User
                </Typography>

                <TextField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    helperText={errors.firstName ? 'First Name is required' : ''}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    helperText={errors.lastName ? 'Last Name is required' : ''}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="User Name"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    error={errors.userName}
                    helperText={errors.userName ? 'User Name is required' : ''}
                    fullWidth
                    margin="normal"
                />

                <PasswordField
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    helperText={errors.password ? 'Password is required' : ''}
                />

                <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    helperText={errors.confirmPassword ? 'Passwords do not match' : ''}
                />

                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Register New User
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default RegisterUserModal;

import React, {useState} from 'react';
import {Box, Button, Modal, TextField, Typography} from '@mui/material';
import InputAdornment from "@mui/material/InputAdornment";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import {Preference} from "../../models/models.ts";

interface AddPreferenceModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Preference) => void;
}

const AddPreferenceModal: React.FC<AddPreferenceModalProps> = ({open, onClose, onSubmit}) => {
    const userId = Number(localStorage.getItem('userId')) || -1;
    const [formData, setFormData] = useState({
        key: '',
        value: '',
    });

    const [errors, setErrors] = useState({
        key: false,
        value: false,
    });

    const resetForm = () => {
        setFormData({
            key: '',
            value: '',
        });
        setErrors({
            key: false,
            value: false,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const validateForm = () => {
        const newErrors = {
            key: !formData.key.trim(),
            value: !formData.value.trim(),
        };
        setErrors(newErrors);

        return !Object.values(newErrors).some((error) => error);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const {key, value} = formData;
            onSubmit({key, value, userId});
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
                    Add Preference
                </Typography>

                <TextField
                    label="Key"
                    name="key"
                    value={formData.key}
                    onChange={handleInputChange}
                    error={errors.key}
                    helperText={errors.key ? 'Key is required' : ''}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <VpnKeyIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    label="Value"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    error={errors.value}
                    helperText={errors.value ? 'Value is required' : ''}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <TextFieldsIcon/>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                    <Button variant="outlined" color="primary" onClick={handleSubmit}>
                        Add
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AddPreferenceModal;

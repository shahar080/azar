import React from 'react';
import {Chip} from '@mui/material';

interface CustomLabelProps {
    label: string;
    onRemove: (label: string) => void;
}

const CustomLabel: React.FC<CustomLabelProps> = ({label, onRemove}) => {
    return (
        <Chip
            key={label}
            label={label}
            onDelete={() => onRemove(label)}
            color="primary"
            sx={{margin: '4px'}}
        />
    );
};

export default CustomLabel;

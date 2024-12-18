import React, {useState} from 'react';
import {Box, MenuItem, Select, SelectChangeEvent} from '@mui/material';
import CustomLabel from './CustomLabel.tsx';

interface CustomLabelManagerProps {
    availableLabels: string[];
    selectedLabels: string[];
    onAddLabel: (label: string) => void;
    onRemoveLabel: (label: string) => void;
}

const CustomLabelManager: React.FC<CustomLabelManagerProps> = ({
                                                                   availableLabels,
                                                                   selectedLabels,
                                                                   onAddLabel,
                                                                   onRemoveLabel,
                                                               }) => {
    const [currentLabel, setCurrentLabel] = useState('');

    const handleAddLabel = (event: SelectChangeEvent<string>) => {
        const labelToAdd = event.target.value;
        if (labelToAdd && !selectedLabels.includes(labelToAdd)) {
            onAddLabel(labelToAdd);
        }
        setCurrentLabel('');
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Select
                value={currentLabel}
                onChange={handleAddLabel}
                displayEmpty
                sx={{width: 200}} // Fixed width
            >
                <MenuItem value="" disabled>
                    Add Label
                </MenuItem>
                {availableLabels.map((label) => (
                    <MenuItem key={label} value={label}>
                        {label}
                    </MenuItem>
                ))}
            </Select>

            {/* Render Selected Labels */}
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                {selectedLabels.map((label) => (
                    <CustomLabel key={label} label={label} onRemove={onRemoveLabel}/>
                ))}
            </Box>
        </Box>
    );
};

export default CustomLabelManager;

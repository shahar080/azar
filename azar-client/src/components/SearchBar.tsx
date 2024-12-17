import React, {useState} from 'react';
import {Autocomplete, Box, Button, Chip, MenuItem, Select, SelectChangeEvent, TextField} from '@mui/material';

interface SearchBarProps {
    onSearch: (query: string, labels: string[]) => void;
    onFileUpload: (file: File) => void;
    availableLabels: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, onFileUpload, availableLabels}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [dropdownLabel, setDropdownLabel] = useState('');

    /** Trigger search on any change */
    const triggerSearch = (query: string, labels: string[]) => {
        onSearch(query, labels);
    };

    /** Handle adding labels */
    const handleAddLabel = (label: string) => {
        if (availableLabels.includes(label) && !selectedLabels.includes(label)) {
            const updatedLabels = [...selectedLabels, label];
            setSelectedLabels(updatedLabels);
            triggerSearch(searchQuery, updatedLabels);
            setSearchQuery('');
        }
    };

    /** Handle removing labels */
    const handleRemoveLabel = (label: string) => {
        const updatedLabels = selectedLabels.filter((l) => l !== label);
        setSelectedLabels(updatedLabels);
        triggerSearch(searchQuery, updatedLabels);
    };

    /** Handle search bar text input */
    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        triggerSearch(query, selectedLabels);
    };

    /** Handle pressing Enter in search bar */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            handleAddLabel(searchQuery.trim());
            setSearchQuery('');
        }
    };

    /** Handle dropdown label selection */
    const handleDropdownChange = (e: SelectChangeEvent) => {
        const label = e.target.value;
        if (label) {
            handleAddLabel(label);
            setDropdownLabel('');
        }
    };

    /** Handle file uploads */
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {/* Search Bar and Labels */}
            <Box sx={{display: 'flex', gap: 1, alignItems: 'center', width: '100%'}}>
                <Autocomplete
                    multiple
                    freeSolo
                    options={availableLabels.filter((label) => !selectedLabels.includes(label))}
                    value={selectedLabels}
                    onChange={(_, newLabels) => {
                        setSelectedLabels(newLabels);
                        triggerSearch(searchQuery, newLabels);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((label, index) => (
                            <Chip
                                label={label}
                                {...getTagProps({index})}
                                onDelete={() => handleRemoveLabel(label)}
                                color="primary"
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search by Name or Add Labels"
                            value={searchQuery}
                            onChange={handleSearchQueryChange}
                            onKeyDown={handleKeyPress}
                            fullWidth
                        />
                    )}
                    sx={{flexGrow: 1}}
                />

                {/* Dropdown for Labels */}
                <Select
                    value={dropdownLabel}
                    displayEmpty
                    onChange={handleDropdownChange}
                >
                    <MenuItem value="" disabled>Select Label</MenuItem>
                    {availableLabels
                        .filter((label) => !selectedLabels.includes(label))
                        .map((label) => (
                            <MenuItem key={label} value={label}>
                                {label}
                            </MenuItem>
                        ))}
                </Select>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => triggerSearch(searchQuery, selectedLabels)}
                >
                    Search
                </Button>
            </Box>

            {/* File Upload */}
            <Box>
                <Button variant="contained" component="label" color="secondary">
                    Upload PDF
                    <input
                        type="file"
                        hidden
                        onChange={handleFileInputChange}
                        accept="application/pdf"
                    />
                </Button>
            </Box>
        </Box>
    );
};

export default SearchBar;

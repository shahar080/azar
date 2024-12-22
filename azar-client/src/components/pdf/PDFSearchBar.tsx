import React, {useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import CustomLabel from "../label/CustomLabel.tsx";

interface SearchBarProps {
    onSearch: (query: string, labels: string[]) => void;
    onFileUpload: (file: File) => void;
    viewMode: string;
    handleViewToggle: (_event: React.MouseEvent<HTMLElement>, newView: 'list' | 'gallery') => void;
    availableLabels: string[];
}

const PDFSearchBar: React.FC<SearchBarProps> = ({
                                                    onSearch,
                                                    onFileUpload,
                                                    viewMode,
                                                    handleViewToggle,
                                                    availableLabels
                                                }) => {
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
        triggerSearch(e.target.value, selectedLabels);
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
                            <CustomLabel
                                label={label}
                                onRemove={() => handleRemoveLabel(label)}
                                {...getTagProps({index})}
                            />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search.."
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
                    <MenuItem value="" disabled>Label</MenuItem>
                    {availableLabels
                        .filter((label) => !selectedLabels.includes(label))
                        .map((label) => (
                            <MenuItem key={label} value={label}>
                                {label}
                            </MenuItem>
                        ))}
                </Select>

                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => triggerSearch(searchQuery, selectedLabels)}
                >
                    Search
                </Button>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 2,
                    gap: 2,
                }}
            >
                {/* Left Side: Upload PDF Button */}
                <Box>
                    <Button variant="outlined" component="label" color="secondary">
                        Upload PDF
                        <input
                            type="file"
                            hidden
                            onChange={handleFileInputChange}
                            accept="application/pdf"
                        />
                    </Button>
                </Box>

                {/* Right Side: View Toggle Buttons */}
                <Box>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={handleViewToggle}
                        aria-label="view mode"
                    >
                        <ToggleButton value="list">List View</ToggleButton>
                        <ToggleButton value="gallery">Gallery View</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        </Box>
    );
};

export default PDFSearchBar;

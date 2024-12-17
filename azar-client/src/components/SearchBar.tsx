import React, {useState} from 'react';
import {Box, Button, Input, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField,} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
    onSearch: (query: string, labels: string[]) => void; // Accepts labels as an array
    onFileUpload: (file: File) => void;
    availableLabels: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
                                                 onSearch,
                                                 onFileUpload,
                                                 availableLabels,
                                             }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    const handleSearch = () => {
        onSearch(searchQuery, selectedLabels); // Pass array of selected labels
    };

    const handleLabelChange = (event: SelectChangeEvent<string[]>) => {
        setSelectedLabels(event.target.value as string[]);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f9f9f9',
                padding: 2,
                borderRadius: 2,
            }}
        >
            {/* Search by Name */}
            <TextField
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}
                sx={{flex: 1}}
            />

            {/* Dropdown for Labels */}
            <Select
                multiple
                value={selectedLabels}
                onChange={handleLabelChange}
                displayEmpty
                fullWidth
                variant="outlined"
                sx={{flex: 1}}
            >
                <MenuItem disabled value="">
                    Select Labels
                </MenuItem>
                {availableLabels.map((label) => (
                    <MenuItem key={label} value={label}>
                        {label}
                    </MenuItem>
                ))}
            </Select>

            {/* Upload PDF */}
            <Button variant="contained" component="label" color="primary">
                Upload PDF
                <Input
                    type="file"
                    inputProps={{accept: 'application/pdf'}}
                    onChange={handleFileChange}
                    sx={{display: 'none'}}
                />
            </Button>

            {/* Search Button */}
            <Button
                variant="contained"
                color="secondary"
                onClick={handleSearch}
                sx={{height: '100%'}}
            >
                Search
            </Button>
        </Box>
    );
};

export default SearchBar;

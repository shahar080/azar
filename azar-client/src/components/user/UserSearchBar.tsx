import React, {useState} from 'react';
import {Box, TextField, Button} from '@mui/material';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const UserSearchBar: React.FC<SearchBarProps> = ({onSearch}) => {
    const [searchQuery, setSearchQuery] = useState('');

    /** Handle search bar text input */
    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value)
    };

    /** Trigger search when the button is clicked */
    const handleSearchClick = () => {
        onSearch(searchQuery);
    };

    return (
        <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
            <TextField
                value={searchQuery}
                onChange={handleSearchQueryChange}
                placeholder="Search..."
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleSearchClick}>
                Search
            </Button>
        </Box>
    );
};

export default UserSearchBar;

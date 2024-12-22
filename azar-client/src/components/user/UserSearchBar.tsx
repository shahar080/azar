import React, {useState} from 'react';
import {Box, Button, TextField} from '@mui/material';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onAddUser: () => void;
}

const UserSearchBar: React.FC<SearchBarProps> = ({onSearch, onAddUser}) => {
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
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            {/* Search Bar */}
            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                <TextField
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                    placeholder="Search..."
                    fullWidth
                />
                <Button variant="outlined" color="primary" onClick={handleSearchClick}>
                    Search
                </Button>
            </Box>

            {/* Button Under Search Bar */}
            <Box sx={{display: 'flex', justifyContent: 'flex-start'}}>
                <Button variant="outlined" color="secondary" onClick={onAddUser}>
                    Add user
                </Button>
            </Box>
        </Box>

    );
};

export default UserSearchBar;

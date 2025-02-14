import React, {useEffect, useState} from 'react';
import {Autocomplete, Box, Button, TextField} from '@mui/material';
import {getSearchWidthPercentageDynamic} from "./galleryFunctions.ts";

interface SearchBarProps {
    onSearch: (query: string, labels: string[]) => void;
    cityCountries?: Set<string>;
}

const GallerySearchBar: React.FC<SearchBarProps> = ({
                                                        onSearch,
                                                        cityCountries,
                                                    }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [width, setWidth] = useState(window.innerWidth);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

    const triggerSearch = (query: string, labels: string[]) => {
        onSearch(query, labels);
    };

    const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        triggerSearch(e.target.value, selectedLabels);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            setSearchQuery('');
        }
    };

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 2, width: getSearchWidthPercentageDynamic(width)}}>
            <Box sx={{display: "flex", justifyContent: "center", width: "100%"}}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Autocomplete
                        multiple
                        freeSolo
                        options={cityCountries
                            ? Array.from(cityCountries)
                                .filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
                                .slice(0, 5)
                            : []
                        }
                        onChange={(_, newLabels) => {
                            setSelectedLabels(newLabels);
                            triggerSearch(searchQuery, newLabels);
                        }}
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
                        sx={{width: "100%"}}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => triggerSearch(searchQuery, selectedLabels)}
                    >
                        Search
                    </Button>
                </Box>
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
            </Box>
        </Box>
    );

};

export default GallerySearchBar;

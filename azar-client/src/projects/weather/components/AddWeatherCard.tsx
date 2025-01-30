import React, {useState} from "react";
import {Autocomplete, Box, Button, Card, CardContent, CircularProgress, TextField, Typography} from "@mui/material";
import {DBWeatherLocation} from "../models/models.ts";
import {getCitiesByInput} from "../server/api/weatherApi.ts";

interface AddWeatherCardProps {
    onAdd: (dbWeatherLocation: DBWeatherLocation) => Promise<void>;
}

const AddWeatherCard: React.FC<AddWeatherCardProps> = ({onAdd}) => {
    const [options, setOptions] = useState<DBWeatherLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<DBWeatherLocation | null>(null);

    const handleAdd = () => {
        if (selectedLocation) {
            onAdd(selectedLocation);
        }
    };

    const fetchCities = async (query: string) => {
        try {
            setLoading(true);
            const response = await getCitiesByInput({input: query});
            setOptions(response);
        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            setLoading(false);
        }
    };

    const cardWidth = {
        xs: "100%",
        sm: "70%",
        md: "60%",
        lg: "100%",
    };

    const cardHeight = {
        xs: "100%",
        sm: "70%",
        md: "60%",
        lg: "100%",
    };

    const borderRadius = "1vw";

    return (
        <Card
            sx={{
                minWidth: cardWidth,
                minHeight: cardHeight,
                maxWidth: cardWidth,
                maxHeight: cardHeight,
                borderRadius: borderRadius,
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <CardContent>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 2}}>
                    <Typography variant="h6">Choose a city</Typography>
                    <Autocomplete
                        options={options}
                        getOptionLabel={(option) => option.name + ", " + option.country}
                        filterOptions={(x) => x}
                        onInputChange={(_, value) => {
                            if (value.length > 2) fetchCities(value);
                        }}
                        onChange={(_, newValue) => {
                            setSelectedLocation(newValue);
                        }}
                        loading={loading}
                        sx={{width: "150%",}}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select City"
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress size={20}/> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAdd}
                        disabled={!selectedLocation}
                        sx={{
                            textTransform: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                        }}
                    >
                        Add
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AddWeatherCard;

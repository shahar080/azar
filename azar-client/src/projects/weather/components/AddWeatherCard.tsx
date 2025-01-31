import React, {useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {LocationOn} from "@mui/icons-material";
import {DBWeatherLocation} from "../models/models.ts";
import {getByLatLong, getCitiesByInput} from "../server/api/weatherApi.ts";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {useTheme} from "@mui/material/styles";

interface AddWeatherCardProps {
    addLocationByObj: (dbWeatherLocation: DBWeatherLocation) => Promise<void>;
}

const AddWeatherCard: React.FC<AddWeatherCardProps> = ({addLocationByObj}) => {
    const [options, setOptions] = useState<DBWeatherLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<DBWeatherLocation | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const {showToast} = useToast();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleAdd = () => {
        if (selectedLocation) {
            addLocationByObj(selectedLocation);
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

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser.", "error");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const {latitude, longitude} = position.coords;
                addLocationByLatLong(latitude.toString(), longitude.toString())
                    .finally(() => setIsLocating(false));
            },
            (error) => {
                console.error("Error getting location:", error);
                showToast("Could not retrieve location. Please try again.", "error");
                setIsLocating(false);
            }
        );
    };

    const addLocationByLatLong = async (latitude: string, longitude: string) => {
        getByLatLong({latitude: latitude, longitude: longitude})
            .then(getByLatLongResponse => {
                const dbWeatherLocation: DBWeatherLocation = {
                    id: Date.now(),
                    longitude: getByLatLongResponse.coord.lon.toString(),
                    latitude: getByLatLongResponse.coord.lat.toString(),
                    country: getByLatLongResponse.sys.country,
                    name: getByLatLongResponse.name,
                }
                addLocationByObj(dbWeatherLocation);
            })
    };

    return (
        <Card
            sx={{
                minWidth: {
                    xs: "100%",
                    sm: "70%",
                    md: "60%",
                    lg: "100%",
                },
                borderRadius: "1vw",
                margin: "0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                textAlign: "center",
                padding: "16px",
                height: isMobile ? "100%" : "75%",
            }}
        >
            <CardContent>
                <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", gap: 2}}>
                    <Typography variant="h6">Choose a city</Typography>

                    <Autocomplete
                        options={options}
                        getOptionLabel={(option) => `${option.name}, ${option.country}`}
                        filterOptions={(x) => x}
                        onInputChange={async (_, value) => {
                            if (value.length > 2) {
                                try {
                                    await fetchCities(value);
                                } catch (error) {
                                    console.error("Error in fetchCities:", error);
                                }
                            }
                        }}
                        onChange={(_, newValue) => {
                            setSelectedLocation(newValue);
                        }}
                        loading={loading}
                        sx={{width: "100%"}}
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

                    <Box sx={{display: "flex", gap: 2}}>
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

                        <IconButton
                            color="primary"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                        >
                            {isLocating ? <CircularProgress size={24}/> : <LocationOn/>}
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AddWeatherCard;

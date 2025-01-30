import {Box, Grid, Typography} from "@mui/material";
import WeatherCard from "../components/WeatherCard";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";
import {WEATHER_LOCATIONS_STRING} from "../utils/constants.ts";
import {DBWeatherLocation} from "../models/models.ts";
import LocalStorageManager from "../../shared/utils/LocalStorageManager.ts";
import {useEffect, useState} from "react";
import AddWeatherCard from "../components/AddWeatherCard.tsx";
import {useToast} from "../../shared/utils/toast/useToast.ts";

export function WeatherHomePage() {
    const [locations, setLocations] = useState<DBWeatherLocation[]>([]);

    const {showToast} = useToast();

    useEffect(() => {
        setLocations(LocalStorageManager.getItemWithDefault(WEATHER_LOCATIONS_STRING, []))
    }, []);

    const addLocation = async (dbWeatherLocation: DBWeatherLocation) => {
        if (locations.some(location => location.id === dbWeatherLocation.id)) {
            showToast("You can't add the same location twice", "warning")
            return;
        }
        const updatedLocations = [...locations, dbWeatherLocation];
        setLocations(updatedLocations);
        LocalStorageManager.setItem(WEATHER_LOCATIONS_STRING, updatedLocations)
    }

    const removeLocation = (id: number) => {
        const updatedLocations = locations.filter(location => location.id !== id);
        setLocations(updatedLocations);
        LocalStorageManager.setItem(WEATHER_LOCATIONS_STRING, updatedLocations);
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                overflowX: "hidden",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <GeneralMenu zIndex={5}/>
            {/* Top */}
            <Box
                sx={{
                    height: "80vh",
                    width: "100%",
                    background: `
                        linear-gradient(to bottom, rgba(255, 255, 255, 0) 70%, white),
                        url('/weather_bg.webp')
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center top",
                    backgroundRepeat: "no-repeat",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >


                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="#4caf50"
                    sx={{
                        position: "absolute",
                        top: "10%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 2,
                        textAlign: "center",
                    }}
                >
                    Weather
                </Typography>
            </Box>

            <Box
                sx={{
                    width: "100%",
                    backgroundColor: "white",
                    position: "relative",
                    zIndex: 2,
                    paddingTop: "20px",
                    minHeight: "18vh",
                }}
            >
                <Box
                    sx={{
                        maxWidth: "1200px",
                        margin: "-65vh auto 0",
                        width: "100%",
                    }}
                >
                    <Grid container spacing={3} justifyContent="center">
                        {locations.map((location, index) => (
                            <Grid
                                item
                                key={index}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <WeatherCard
                                    id={location.id}
                                    latitude={location.latitude}
                                    longitude={location.longitude}
                                    onDelete={id => removeLocation(id)}
                                />
                            </Grid>
                        ))}
                        <Grid
                            item
                            key={Date.now()}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <AddWeatherCard onAdd={addLocation}/>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}


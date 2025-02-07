import {useEffect, useState} from "react";
import {Box, GlobalStyles, Grid, Typography} from "@mui/material";
import WeatherCard from "../components/WeatherCard";
import {GeneralMenu} from "../../shared/components/GeneralMenu.tsx";
import {WEATHER_LOCATIONS_STRING} from "../utils/constants.ts";
import {Coordinates, DBWeatherLocation} from "../models/models.ts";
import LocalStorageManager from "../../shared/utils/LocalStorageManager.ts";
import AddWeatherCard from "../components/AddWeatherCard.tsx";
import {useToast} from "../../shared/utils/toast/useToast.ts";
import {SourceCodeButton} from "../../shared/components/SourceCodeButton.tsx";
import {WeatherLatLongResponse} from "../server/api/responses.ts";
import ExtendedWeatherInfo from "../components/ExtendedWeatherInfo.tsx";
import ForecastInfo from "../components/forecast/ForecastInfo.tsx";

export function WeatherHomePage() {
    const [locations, setLocations] = useState<DBWeatherLocation[]>([]);
    const [extendedViewData, setExtendedViewData] = useState<WeatherLatLongResponse | null>(null);
    const [forecastData, setForecastData] = useState<Coordinates | null>(null);
    const [is12Hour, setIs12Hour] = useState<boolean>(true);
    const {showToast} = useToast();

    useEffect(() => {
        setLocations(LocalStorageManager.getItemWithDefault(WEATHER_LOCATIONS_STRING, []));
    }, []);

    const addLocationByObj = async (dbWeatherLocation: DBWeatherLocation) => {
        if (locations.some(location => ((location.id === dbWeatherLocation.id))
            || (location.longitude === dbWeatherLocation.longitude && location.latitude === dbWeatherLocation.latitude))) {
            showToast("You can't add the same location twice", "warning");
            return;
        }
        const updatedLocations = [...locations, dbWeatherLocation];
        setLocations(updatedLocations);
        LocalStorageManager.setItem(WEATHER_LOCATIONS_STRING, updatedLocations);
    };

    const removeLocation = (id: number) => {
        const updatedLocations = locations.filter(location => location.id !== id);
        setLocations(updatedLocations);
        LocalStorageManager.setItem(WEATHER_LOCATIONS_STRING, updatedLocations);
    };

    return (
        <>
            <GlobalStyles
                styles={{
                    "*": {
                        boxSizing: "border-box",
                    },
                }}
            />
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100vw",
                    overflowX: "hidden",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                <GeneralMenu zIndex={5}/>
                {/* Top */}
                <Box
                    sx={{
                        height: "82vh",
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
                        <Grid container spacing={3} justifyContent="flex-start">
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
                                        onShowExtendedView={(getByLatLongResponse, is12HourRes) => {
                                            setExtendedViewData(getByLatLongResponse);
                                            setIs12Hour(is12HourRes);
                                        }}
                                        onShowForecast={(latitude, longitude, is12HourRes) => {
                                            setForecastData({latitude: latitude, longitude: longitude});
                                            setIs12Hour(is12HourRes);
                                        }}
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
                                    alignItems: "start",
                                    justifyContent: "start",
                                }}
                            >
                                <AddWeatherCard addLocationByObj={addLocationByObj}/>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                <SourceCodeButton/>
                {extendedViewData !== null &&
                    <ExtendedWeatherInfo
                        extendedViewData={extendedViewData}
                        is12Hour={is12Hour}
                        onClose={() => setExtendedViewData(null)}
                    />
                }
                {forecastData !== null &&
                    <ForecastInfo
                        latitude={forecastData.latitude}
                        longitude={forecastData.longitude}
                        is12Hour={is12Hour}
                        onClose={() => setForecastData(null)}
                    />
                }
            </Box>
        </>
    );
}

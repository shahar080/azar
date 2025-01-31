import React, {useEffect, useState} from "react";
import {Box, Card, CardContent, CircularProgress, Grid, IconButton, Tooltip, Typography} from "@mui/material";
import {Cloud, Delete, Grain, Thunderstorm, WbSunny} from "@mui/icons-material";
import {getByLatLong} from "../server/api/weatherApi";
import {GetByLatLongResponse} from "../server/api/responses";

interface WeatherCardProps {
    id: number;
    longitude: string;
    latitude: string;
    onDelete: (id: number) => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({id, longitude, latitude, onDelete}) => {
    const [getByLatLongResponse, setGetByLatLongResponse] = useState<GetByLatLongResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [localTime, setLocalTime] = useState<string>("");

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

    const calculateLocalTime = (timezoneOffset: number): string => {
        const utcTime = new Date();
        const localTime = new Date(utcTime.getTime() + utcTime.getTimezoneOffset() * 60000 + timezoneOffset * 1000);
        return localTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };


    useEffect(() => {
        setIsLoading(true);
        setHasError(false);

        getByLatLong({latitude, longitude})
            .then((response) => {
                setGetByLatLongResponse(response);
                setIsLoading(false);

                const intervalId = setInterval(() => {
                    setLocalTime(calculateLocalTime(response.timezone));
                }, 1000);

                return () => clearInterval(intervalId);
            })
            .catch(() => {
                setHasError(true);
                setIsLoading(false);
            });
    }, [latitude, longitude]);

    const getWeatherIcon = (main: string) => {
        switch (main) {
            case "Clear":
                return <WbSunny fontSize="large"/>;
            case "Clouds":
                return <Cloud fontSize="large"/>;
            case "Rain":
                return <Grain fontSize="large"/>;
            case "Thunderstorm":
                return <Thunderstorm fontSize="large"/>;
            default:
                return <WbSunny fontSize="large"/>;
        }
    };

    if (isLoading) {
        return (
            <Card
                sx={{
                    minWidth: cardWidth,
                    minHeight: cardHeight,
                    maxWidth: cardWidth,
                    maxHeight: cardHeight,
                    borderRadius: borderRadius,
                    margin: "auto",
                    textAlign: "center",
                }}
            >
                <CircularProgress/>
                <Typography variant="body1" mt={2}>
                    Loading weather data...
                </Typography>
            </Card>
        );
    }

    if (hasError) {
        return (
            <Card
                sx={{
                    minWidth: cardWidth,
                    minHeight: cardHeight,
                    maxWidth: cardWidth,
                    maxHeight: cardHeight,
                    borderRadius: borderRadius,
                    margin: "auto",
                    textAlign: "center",
                }}
            >
                <Typography variant="body1" color="error">
                    Couldn't load weather data...
                </Typography>
            </Card>
        );
    }

    if (!getByLatLongResponse) return null;

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
                justifyContent: "space-between",
                position: "relative",
            }}
        >

            <IconButton
                sx={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    zIndex: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                }}
                onClick={() => onDelete(id)}
            >
                <Delete/>
            </IconButton>

            <CardContent sx={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                {/* Top Section */}
                <Box>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            {getWeatherIcon(getByLatLongResponse.weather[0].main)}
                        </Grid>
                        <Grid item xs={10}>
                            <Tooltip title={`${getByLatLongResponse.name}, ${getByLatLongResponse.sys.country}`}>
                                <Typography variant="h5">
                                    {getByLatLongResponse.name}, {getByLatLongResponse.sys.country}
                                </Typography>
                            </Tooltip>
                            <Typography variant="h6">{getByLatLongResponse.main.temp}°C</Typography>
                            <Typography variant="body1">
                                {getByLatLongResponse.weather[0].description}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Center Section */}
                <Box sx={{textAlign: "center"}}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Humidity: {getByLatLongResponse.main.humidity}%
                            </Typography>
                            <Typography variant="body2">
                                Pressure: {getByLatLongResponse.main.pressure} hPa
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Wind: {getByLatLongResponse.wind.speed} m/s
                            </Typography>
                            <Typography variant="body2">
                                Visibility: {(getByLatLongResponse.visibility / 1000).toFixed(1)} km
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Bottom Section */}
                <Box>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Sunrise: {new Date(getByLatLongResponse.sys.sunrise * 1000).toLocaleTimeString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">
                                Sunset: {new Date(getByLatLongResponse.sys.sunset * 1000).toLocaleTimeString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2">
                                Local Time: {localTime || "Loading..."}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    );
};

export default WeatherCard;

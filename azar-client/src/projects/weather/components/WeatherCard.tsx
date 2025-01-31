import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    GlobalStyles,
    Grid,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {getByLatLong} from "../server/api/weatherApi";
import {GetByLatLongResponse} from "../server/api/responses";
import {COMIC_NEUE_FONT} from "../../shared/utils/constants.ts";
import {getWeatherIcon} from "../utils/sharedLogic.tsx";

interface WeatherCardProps {
    id: number;
    longitude: string;
    latitude: string;
    onDelete: (id: number) => void;
    onShowExtendedView: (getByLatLongResponse: GetByLatLongResponse) => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({id, longitude, latitude, onDelete, onShowExtendedView}) => {
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

    if (isLoading) {
        return (
            <Card
                sx={{
                    minWidth: cardWidth,
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
        <>
            <GlobalStyles
                styles={{
                    "*": {
                        fontFamily: COMIC_NEUE_FONT,
                    },
                }}
            />
            <Card
                sx={{
                    minWidth: cardWidth,
                    borderRadius: borderRadius,
                    margin: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    padding: "16px",
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

                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "16px",
                    }}
                >
                    {/* Header Section */}
                    <Box>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                                {getWeatherIcon(getByLatLongResponse.weather[0].main)}
                            </Grid>
                            <Grid item xs={10}>
                                <Tooltip title={`${getByLatLongResponse.name}, ${getByLatLongResponse.sys.country}`}>
                                    <Typography paddingLeft={"1vw"} variant="h5" noWrap>
                                        {getByLatLongResponse.name}
                                    </Typography>
                                </Tooltip>
                                <Typography paddingLeft={"1vw"}
                                            variant="h6">{Math.floor(getByLatLongResponse.main.temp)}°C</Typography>
                                <Typography paddingLeft={"1vw"} variant="body1" noWrap>
                                    {getByLatLongResponse.weather[0].description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Middle Section */}
                    <Box sx={{textAlign: "center"}}>
                        <Typography variant="h6" sx={{fontWeight: "bold"}}>
                            Local Time:
                        </Typography>
                        <Typography variant="h5">
                            {localTime || "Loading..."}
                        </Typography>
                        <Typography paddingTop={"1vw"} textAlign={"left"} variant="body1">
                            Sunrise: {new Date(getByLatLongResponse.sys.sunrise * 1000).toLocaleTimeString()}
                        </Typography>
                        <Typography textAlign={"left"} variant="body1">
                            Sunset: {new Date(getByLatLongResponse.sys.sunset * 1000).toLocaleTimeString()}
                        </Typography>
                    </Box>

                    {/* Footer Section */}

                    <Box sx={{textAlign: "center", mt: "auto"}}>
                        <Tooltip title={"Click me for further information"}>
                            <Typography
                                variant="h6"
                                sx={{
                                    border: "1px solid black",
                                    padding: "4px",
                                    borderRadius: "2vw",
                                    cursor: "pointer",
                                }}
                                onClick={() => onShowExtendedView(getByLatLongResponse)}
                            >
                                → {getByLatLongResponse.sys.country} ←
                            </Typography>
                        </Tooltip>
                    </Box>
                </CardContent>
            </Card>
        </>
    );
};

export default WeatherCard;

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
    Typography,
} from "@mui/material";
import {AccessTime, AvTimer, Delete, Refresh} from "@mui/icons-material";
import {getByLatLong} from "../server/api/weatherApi";
import {GetByLatLongResponse} from "../server/api/responses";
import {COMIC_NEUE_FONT} from "../../shared/utils/constants.ts";
import {convertEpochToLocalTime, getWeatherIcon} from "../utils/sharedLogic.tsx";
import {getCardStyles} from "../utils/weatherStyles";

interface WeatherCardProps {
    id: number;
    longitude: string;
    latitude: string;
    onDelete: (id: number) => void;
    onShowExtendedView: (
        getByLatLongResponse: GetByLatLongResponse,
        is12Hour: boolean
    ) => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
                                                     id,
                                                     longitude,
                                                     latitude,
                                                     onDelete,
                                                     onShowExtendedView,
                                                 }) => {
    const [getByLatLongResponse, setGetByLatLongResponse] =
        useState<GetByLatLongResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);
    const [localTime, setLocalTime] = useState<string>("");
    const [is12Hour, setIs12Hour] = useState<boolean>(true);
    const [sunriseTime, setSunriseTime] = useState<string>("");
    const [sunsetTime, setSunsetTime] = useState<string>("");
    const [retry, setRetry] = useState<boolean>(false);

    const cardWidth = {
        xs: "100%",
        sm: "70%",
        md: "60%",
        lg: "100%",
    };

    const borderRadius = "1vw";

    const switchClockTime = () => {
        setIs12Hour((prev) => !prev);
    };

    useEffect(() => {
        setIsLoading(true);
        setHasError(false);

        getByLatLong({latitude, longitude})
            .then((response) => {
                setGetByLatLongResponse(response);

                const sunriseDate = convertEpochToLocalTime(
                    response.sys.sunrise,
                    response.timezone,
                    is12Hour
                );
                const sunsetDate = convertEpochToLocalTime(
                    response.sys.sunset,
                    response.timezone,
                    is12Hour
                );

                setSunriseTime(sunriseDate);
                setSunsetTime(sunsetDate);

                setIsLoading(false);
            })
            .catch(() => {
                setHasError(true);
                setIsLoading(false);
            });
    }, [latitude, longitude, retry]);

    useEffect(() => {
        if (!getByLatLongResponse) return;

        const updateTime = () => {
            const currentEpochTime = Math.floor(Date.now() / 1000);
            const localTime = convertEpochToLocalTime(
                currentEpochTime,
                getByLatLongResponse.timezone,
                is12Hour
            );
            setLocalTime(localTime);
        };

        updateTime();

        const sunriseDate = convertEpochToLocalTime(
            getByLatLongResponse.sys.sunrise,
            getByLatLongResponse.timezone,
            is12Hour
        );
        const sunsetDate = convertEpochToLocalTime(
            getByLatLongResponse.sys.sunset,
            getByLatLongResponse.timezone,
            is12Hour
        );
        setSunriseTime(sunriseDate);
        setSunsetTime(sunsetDate);

        const intervalId = setInterval(updateTime, 1000);

        return () => clearInterval(intervalId);
    }, [getByLatLongResponse, is12Hour]);

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
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    padding: "16px",
                }}
            >
                <IconButton
                    sx={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        zIndex: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                    }}
                    onClick={() => setRetry((prev) => !prev)}
                >
                    <Refresh/>
                </IconButton>

                <Typography
                    variant="body1"
                    color="error"
                    sx={{
                        textAlign: "center",
                        paddingX: "48px",
                    }}
                >
                    Couldn't load weather data...
                </Typography>

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
            </Card>
        );
    }

    if (!getByLatLongResponse) return null;

    const dynamicStyles = getCardStyles(getByLatLongResponse.weather[0].main);

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
                    backgroundColor: dynamicStyles.backgroundColor,
                    color: dynamicStyles.color,
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
                                <Tooltip
                                    title={`${getByLatLongResponse.name}, ${getByLatLongResponse.sys.country}`}
                                >
                                    <Typography paddingLeft={"1vw"} variant="h5" noWrap>
                                        {getByLatLongResponse.name}
                                    </Typography>
                                </Tooltip>
                                <Typography paddingLeft={"1vw"} variant="h6">
                                    {Math.floor(getByLatLongResponse.main.temp)}°C
                                </Typography>
                                <Typography paddingLeft={"1vw"} variant="body1" noWrap>
                                    {getByLatLongResponse.weather[0].description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Middle Section */}
                    <Box sx={{textAlign: "center"}}>
                        <Grid container spacing={1} alignItems="center" justifyContent="center">
                            <Grid item>
                                <Tooltip
                                    title={`Click me to switch to ${
                                        is12Hour ? "24 hours" : "12 hours"
                                    } format`}
                                >
                                    {is12Hour ? (
                                        <AccessTime sx={{fontSize: "1.6rem"}} onClick={switchClockTime}/>
                                    ) : (
                                        <AvTimer sx={{fontSize: "1.6rem"}} onClick={switchClockTime}/>
                                    )}
                                </Tooltip>
                            </Grid>
                            <Grid item>
                                <Typography variant="h6" sx={{fontWeight: "bold"}}>
                                    Local Time:
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="h5">{localTime || "Loading..."}</Typography>

                        <Typography paddingTop={"1vw"} textAlign={"left"} variant="body1">
                            Sunrise: {sunriseTime}
                        </Typography>
                        <Typography textAlign={"left"} variant="body1">
                            Sunset: {sunsetTime}
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
                                    display: "inline-block",
                                }}
                                onClick={() => onShowExtendedView(getByLatLongResponse, is12Hour)}
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

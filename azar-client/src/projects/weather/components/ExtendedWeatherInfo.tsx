import React, {useContext, useEffect, useState} from "react";
import {Box, Button, Grid, Modal, Typography} from "@mui/material";
import {WeatherLatLongResponse} from "../server/api/responses.ts";
import {convertEpochToLocalTime, getWeatherIcon} from "../utils/sharedLogic.tsx";
import {getCardStyles} from "../utils/weatherStyles.ts";
import {ThemeModeContext} from "../../../theme/ThemeModeContext.tsx";

interface ExtendedWeatherInfoProps {
    extendedViewData: WeatherLatLongResponse;
    is12Hour: boolean;
    onClose: () => void;
}

const ExtendedWeatherInfo: React.FC<ExtendedWeatherInfoProps> = ({extendedViewData, is12Hour, onClose}) => {
    const [sunriseTime, setSunriseTime] = useState<string>("");
    const [sunsetTime, setSunsetTime] = useState<string>("");
    const {mode} = useContext(ThemeModeContext);

    useEffect(() => {
        const sunriseDate = convertEpochToLocalTime(extendedViewData.sys.sunrise, extendedViewData.timezone, is12Hour);
        const sunsetDate = convertEpochToLocalTime(extendedViewData.sys.sunset, extendedViewData.timezone, is12Hour);
        setSunriseTime(sunriseDate);
        setSunsetTime(sunsetDate);
    }, []);

    const dynamicStyles = getCardStyles(extendedViewData.weather[0].main, mode);

    return (
        <Modal open={!!extendedViewData} onClose={onClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    padding: "2rem",
                    borderRadius: "12px",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                    backgroundColor: dynamicStyles.backgroundColor,
                    color: dynamicStyles.color,
                    maxWidth: "600px",
                    width: "90%",
                    textAlign: "center",
                }}
            >
                <Typography variant="h4" sx={{marginBottom: "1rem", fontWeight: "bold"}}>
                    {extendedViewData.name}, {extendedViewData.sys.country}
                </Typography>

                <Typography variant="h6" sx={{marginBottom: "1rem", textTransform: "capitalize"}}>
                    {extendedViewData.weather[0].description} {getWeatherIcon(extendedViewData.weather[0].main)}️
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body1">
                            <strong>Temperature:</strong> {Math.floor(extendedViewData.main.temp)}°C
                        </Typography>
                        <Typography variant="body1">
                            <strong>Feels Like:</strong> {Math.floor(extendedViewData.main.feels_like)}°C
                        </Typography>
                        <Typography variant="body1">
                            <strong>Min Temp:</strong> {Math.floor(extendedViewData.main.temp_min)}°C
                        </Typography>
                        <Typography variant="body1">
                            <strong>Max Temp:</strong> {Math.floor(extendedViewData.main.temp_max)}°C
                        </Typography>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography variant="body1">
                            <strong>Humidity:</strong> {extendedViewData.main.humidity}%
                        </Typography>
                        <Typography variant="body1">
                            <strong>Pressure:</strong> {extendedViewData.main.pressure} hPa
                        </Typography>
                        <Typography variant="body1">
                            <strong>Sea Level:</strong> {extendedViewData.main.sea_level || "N/A"} hPa
                        </Typography>
                        <Typography variant="body1">
                            <strong>Ground Level:</strong> {extendedViewData.main.grnd_level || "N/A"} hPa
                        </Typography>
                    </Grid>
                </Grid>

                <Box sx={{marginTop: "1.5rem"}}>
                    <Typography variant="body1">
                        <strong>Wind Speed:</strong> {extendedViewData.wind.speed} m/s
                    </Typography>
                    <Typography variant="body1">
                        <strong>Wind Direction:</strong> {extendedViewData.wind.deg}°
                    </Typography>
                    <Typography variant="body1">
                        <strong>Cloud Cover:</strong> {extendedViewData.clouds.all}%
                    </Typography>
                    <Typography variant="body1">
                        <strong>Visibility:</strong> {(extendedViewData.visibility / 1000).toFixed(1)} km
                    </Typography>
                </Box>

                <Box sx={{marginTop: "1.5rem"}}>
                    <Typography variant="body1">
                        <strong>Sunrise:</strong>{" "}
                        {sunriseTime}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Sunset:</strong>{" "}
                        {sunsetTime}
                    </Typography>
                </Box>

                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    sx={{
                        marginTop: "2rem",
                        textTransform: "none",
                        fontWeight: "bold",
                    }}
                >
                    Close
                </Button>
            </Box>
        </Modal>
    );
};

export default ExtendedWeatherInfo;

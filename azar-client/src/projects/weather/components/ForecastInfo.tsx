import React, {useContext, useEffect, useState} from "react";
import {
    convertEpochToLocalDate,
    convertEpochToLocalTime,
    getEndianFromLocale,
    getWeatherIcon
} from "../utils/sharedLogic.tsx";
import {getCardStyles} from "../utils/weatherStyles.ts";
import {ThemeModeContext} from "../../../theme/ThemeModeContext.tsx";
import {ForecastLatLongResponse} from "../server/api/responses.ts";
import {getForecastByLatLong} from "../server/api/weatherApi.ts";
import {Box, Button, Grid, IconButton, Modal, Tooltip, Typography} from "@mui/material";
import {ArrowBack, ArrowForward, Language} from "@mui/icons-material";
import {Endian, Locale} from "../models/models.ts";

interface ExtendedWeatherInfoProps {
    latitude: string;
    longitude: string;
    is12Hour: boolean;
    onClose: () => void;
}

const ForecastInfo: React.FC<ExtendedWeatherInfoProps> = ({latitude, longitude, is12Hour, onClose}) => {
    const [forecastLatLongResponse, setForecastLatLongResponse] = useState<ForecastLatLongResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [retry, setRetry] = useState<boolean>(false);
    const [index, setIndex] = useState(0);
    const [dt, setDT] = useState<string>("");
    const [locale, setLocale] = useState<Locale>(Locale.LITTLE_ENDIAN);
    const [localeTooltip, setLocaleTooltip] = useState<string>(`Click me to switch to ${Endian.MIDDLE} format`);
    const {mode} = useContext(ThemeModeContext);

    const updateTime = (updatedIndex: number) => {
        if (forecastLatLongResponse !== null) {
            const dt = (forecastLatLongResponse.list[updatedIndex].dt);
            const time = convertEpochToLocalTime(dt, forecastLatLongResponse.city.timezone, is12Hour);
            const date = convertEpochToLocalDate(dt, forecastLatLongResponse.city.timezone, locale);
            setDT(time + " " + date);
        }
    }

    const handlePrev = () => {
        if (index > 0) {
            const updatedIndex = index - 1;
            setIndex(updatedIndex);
            updateTime(updatedIndex);
        }
    };

    const handleNext = () => {
        if (forecastLatLongResponse !== null) {
            if (index < forecastLatLongResponse.cnt - 1) {
                const updatedIndex = index + 1;
                setIndex(updatedIndex);
                updateTime(updatedIndex);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft") {
            handlePrev();
        } else if (e.key === "ArrowRight") {
            handleNext();
        }
    };

    const handleChangeLocal = () => {
        setLocale((prevLocale) => {
            switch (prevLocale) {
                case Locale.LITTLE_ENDIAN:
                    return Locale.MIDDLE_ENDIAN;
                case Locale.MIDDLE_ENDIAN:
                    return Locale.BIG_ENDIAN;
                case Locale.BIG_ENDIAN:
                default:
                    return Locale.LITTLE_ENDIAN;
            }
        });
    };


    useEffect(() => {
        setIsLoading(true);

        getForecastByLatLong({latitude, longitude})
            .then((response) => {
                setForecastLatLongResponse(response);
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
            });
    }, [latitude, longitude, retry]);

    useEffect(() => {
        updateTime(0);
    }, [forecastLatLongResponse]);

    useEffect(() => {
        updateTime(index);

        switch (locale) {
            case Locale.LITTLE_ENDIAN:
                setLocaleTooltip(`Click me to switch to ${Endian.MIDDLE} format`);
                break;
            case Locale.MIDDLE_ENDIAN:
                setLocaleTooltip(`Click me to switch to ${Endian.BIG} format`);
                break;
            case Locale.BIG_ENDIAN:
            default:
                setLocaleTooltip(`Click me to switch to ${Endian.LITTLE} format`);
                break;
        }
    }, [locale]);

    const dynamicStyles = getCardStyles(forecastLatLongResponse ? forecastLatLongResponse.list[index].weather[0].main : "", mode);

    return (
        <>
            {forecastLatLongResponse === null ?
                (
                    <Modal open onClose={onClose}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                padding: "2rem",
                                borderRadius: "2vw",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                                backgroundColor: "primary.main",
                                color: "secondary.contrastText",
                                maxWidth: "600px",
                                width: "90%",
                                textAlign: "center",
                            }}
                        >
                            {
                                isLoading ?
                                    (
                                        <Typography color="textSecondary">Loading details...</Typography>
                                    ) :
                                    (
                                        <Box textAlign="center">
                                            <Typography color="error" variant="h5" fontWeight={"bold"}>
                                                Could not load forecast..
                                            </Typography>
                                            <Button variant="contained" color="secondary"
                                                    onClick={() => setRetry((prev) => !prev)}
                                                    sx={{mt: 2}}>
                                                Retry
                                            </Button>
                                        </Box>
                                    )
                            }
                        </Box>
                    </Modal>
                ) :
                (
                    <Modal open onClose={onClose}>
                        <Box
                            tabIndex={0}
                            onKeyDown={handleKeyDown}
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                padding: "2rem",
                                borderRadius: "2vw",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
                                backgroundColor: dynamicStyles.backgroundColor,
                                color: dynamicStyles.color,
                                maxWidth: "600px",
                                width: "90%",
                                textAlign: "center",
                                outline: "none",
                            }}
                        >
                            <Box
                                onClick={(e) => {
                                    if (index === 0) {
                                        e.stopPropagation();
                                    }
                                }}
                                sx={{
                                    position: "absolute",
                                    left: "0px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Tooltip title={"-3 hours"} disableInteractive
                                         componentsProps={{
                                             tooltip: {
                                                 sx: {
                                                     bgcolor: 'primary.main',
                                                     fontSize: '1rem',
                                                 },
                                             },
                                         }}
                                >
                                    <IconButton
                                        onClick={handlePrev}
                                        disabled={index === 0}
                                        color="primary"
                                    >
                                        <ArrowBack fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box
                                onClick={(e) => {
                                    if (index === 0) {
                                        e.stopPropagation();
                                    }
                                }}
                                sx={{
                                    position: "absolute",
                                    right: "0px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Tooltip title={"+3 hours"} disableInteractive
                                         componentsProps={{
                                             tooltip: {
                                                 sx: {
                                                     bgcolor: 'primary.main',
                                                     fontSize: '1rem',
                                                 },
                                             },
                                         }}
                                >
                                    <IconButton
                                        onClick={handleNext}
                                        disabled={index === forecastLatLongResponse.list.length - 1}
                                        color="primary"
                                    >
                                        <ArrowForward fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Typography variant="h4" sx={{marginBottom: "1rem", fontWeight: "bold"}}>
                                {forecastLatLongResponse.city.name}, {forecastLatLongResponse.city.country}
                            </Typography>

                            <Typography variant="h6" sx={{marginBottom: "1rem", textTransform: "capitalize"}}>
                                {forecastLatLongResponse.list[index].weather[0].description}{" "}
                                {getWeatherIcon(forecastLatLongResponse.list[index].weather[0].main)}️
                            </Typography>

                            <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                <Tooltip title={localeTooltip} disableInteractive
                                         componentsProps={{
                                             tooltip: {
                                                 sx: {
                                                     bgcolor: 'primary.main',
                                                     fontSize: '1rem',
                                                 },
                                             },
                                         }}
                                >
                                    <IconButton
                                        onClick={handleChangeLocal}
                                        sx={{
                                            color: dynamicStyles.color,
                                        }}
                                    >
                                        <Language fontSize="medium"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    title={`Anticipated date in "${getEndianFromLocale(locale)}" format`}
                                    disableInteractive
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                bgcolor: 'primary.main',
                                                fontSize: '1rem',
                                            },
                                        },
                                    }}
                                >
                                    <Typography variant="body1" fontWeight="body">
                                        {dt}
                                    </Typography>
                                </Tooltip>

                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Temperature:</strong> {Math.floor(forecastLatLongResponse.list[index].main.temp)}°C
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Feels
                                            Like:</strong> {Math.floor(forecastLatLongResponse.list[index].main.feels_like)}°C
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Min
                                            Temp:</strong> {Math.floor(forecastLatLongResponse.list[index].main.temp_min)}°C
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Max
                                            Temp:</strong> {Math.floor(forecastLatLongResponse.list[index].main.temp_max)}°C
                                    </Typography>
                                </Grid>

                                <Grid item xs={6}>
                                    <Typography variant="body1">
                                        <strong>Humidity:</strong> {forecastLatLongResponse.list[index].main.humidity}%
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Pressure:</strong> {forecastLatLongResponse.list[index].main.pressure} hPa
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Sea
                                            Level:</strong> {forecastLatLongResponse.list[index].main.sea_level || "N/A"} hPa
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Ground
                                            Level:</strong> {forecastLatLongResponse.list[index].main.grnd_level || "N/A"} hPa
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{marginTop: "1.5rem"}}>
                                <Typography variant="body1">
                                    <strong>Wind Speed:</strong> {forecastLatLongResponse.list[index].wind.speed} m/s
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Wind Direction:</strong> {forecastLatLongResponse.list[index].wind.deg}°
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Cloud Cover:</strong> {forecastLatLongResponse.list[index].clouds.all}%
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Visibility:</strong> {(forecastLatLongResponse.list[index].visibility / 1000).toFixed(1)} km
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
                )
            }
        </>
    );
};

export default ForecastInfo;

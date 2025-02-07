import {Box, Button, Grid, IconButton, Tooltip, Typography} from "@mui/material";
import {DeviceThermostat, Language} from "@mui/icons-material";
import {
    convertEpochToLocalDate,
    convertEpochToLocalTime,
    getEndianFromLocale,
    getTemperatureAsString,
    getWeatherIcon
} from "../../utils/sharedLogic.tsx";
import React, {forwardRef, useContext, useEffect, useImperativeHandle, useState} from "react";
import {Endian, Locale} from "../../models/models.ts";
import {ForecastChildComponentHandle} from "../../types/ChildComponent.types.ts";
import {getCardStyles} from "../../utils/weatherStyles.ts";
import {ThemeModeContext} from "../../../../theme/ThemeModeContext.tsx";
import {BaseForecastInfoChildProps} from "./ForecastInfo.tsx";

const ForecastDashboard = forwardRef<ForecastChildComponentHandle, BaseForecastInfoChildProps>
((props, ref) => {
    const {
        forecastLatLongResponse, onClose, is12HourInitial, isCelsiusInitial, setIsLeftArrowDisabled,
        setIsRightArrowDisabled, setLeftArrowTooltip, setRightArrowTooltip
    } = props;

        const [index, setIndex] = useState(0);
        const [dt, setDT] = useState<string>("");
        const [locale, setLocale] = useState<Locale>(Locale.LITTLE_ENDIAN);
        const [localeTooltip, setLocaleTooltip] = useState<string>(`Click me to switch to ${Endian.MIDDLE} format`);
    const [isCelsius, setIsCelsius] = useState<boolean>(isCelsiusInitial);
        const {mode} = useContext(ThemeModeContext);

        const updateTime = (updatedIndex: number) => {
            if (forecastLatLongResponse !== null) {
                const dt = (forecastLatLongResponse.list[updatedIndex].dt);
                const time = convertEpochToLocalTime(dt, forecastLatLongResponse.city.timezone, is12HourInitial);
                const date = convertEpochToLocalDate(dt, forecastLatLongResponse.city.timezone, locale);
                setDT(time + " " + date);
            }
        }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowLeft") {
            handleLeftArrowClick();
        } else if (e.key === "ArrowRight") {
            handleRightArrowClick();
        }
    };

    const handleLeftArrowClick = () => {
            if (index > 0) {
                const updatedIndex = index - 1;
                setIndex(updatedIndex);
                updateTime(updatedIndex);
            }
    }

    const handleRightArrowClick = () => {
            if (forecastLatLongResponse !== null) {
                if (index < forecastLatLongResponse.cnt - 1) {
                    const updatedIndex = index + 1;
                    setIndex(updatedIndex);
                    updateTime(updatedIndex);
                }
            }
    }

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

    useEffect(() => {
        setIsLeftArrowDisabled(index === 0);
        setIsRightArrowDisabled(index === forecastLatLongResponse.list.length - 1);
    }, [forecastLatLongResponse.list.length, index, setIsLeftArrowDisabled, setIsRightArrowDisabled]);

    useEffect(() => {
        setLeftArrowTooltip("-3 Hours");
        setRightArrowTooltip("+3 Hours");
    }, []);

        useImperativeHandle(ref, () => ({
            handleKeyDown,
            handleLeftArrowClick,
            handleRightArrowClick,
        }));

        const dynamicStyles = getCardStyles(forecastLatLongResponse.list[index].weather[0].main, mode);

        return (
            <>
                <Typography variant="h4" sx={{marginBottom: "1rem", fontWeight: "bold"}}>
                    {forecastLatLongResponse.city.name}, {forecastLatLongResponse.city.country}
                </Typography>

                <Typography variant="h6" sx={{marginBottom: "1rem", textTransform: "capitalize"}}>
                    {forecastLatLongResponse.list[index].weather[0].description}{" "}
                    {getWeatherIcon(forecastLatLongResponse.list[index].weather[0].main)}️
                </Typography>

                <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
                    <Tooltip
                        title={`${isCelsius ? "Click me to switch to Fahrenheit" : "Click me to switch to Celsius"}`}
                        disableInteractive
                        componentsProps={{
                            tooltip: {
                                sx: {bgcolor: "primary.main", fontSize: "1rem"},
                            },
                        }}
                    >
                        <IconButton onClick={() => setIsCelsius(prev => !prev)} sx={{color: dynamicStyles.color}}>
                            <DeviceThermostat fontSize="medium"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={localeTooltip}
                        disableInteractive
                        componentsProps={{
                            tooltip: {
                                sx: {bgcolor: "primary.main", fontSize: "1rem"},
                            },
                        }}
                    >
                        <IconButton onClick={handleChangeLocal} sx={{color: dynamicStyles.color}}>
                            <Language fontSize="medium"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={`Anticipated date in "${getEndianFromLocale(locale)}" format`}
                        disableInteractive
                        componentsProps={{
                            tooltip: {
                                sx: {bgcolor: "primary.main", fontSize: "1rem"},
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
                            <strong>Temperature:</strong> {getTemperatureAsString(forecastLatLongResponse.list[index].main.temp, isCelsius)}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Feels
                                Like:</strong> {getTemperatureAsString(forecastLatLongResponse.list[index].main.feels_like, isCelsius)}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Min
                                Temp:</strong> {getTemperatureAsString(forecastLatLongResponse.list[index].main.temp_min, isCelsius)}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Max
                                Temp:</strong> {getTemperatureAsString(forecastLatLongResponse.list[index].main.temp_max, isCelsius)}
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
                                Level:</strong> {forecastLatLongResponse.list[index].main.sea_level} hPa
                        </Typography>
                        <Typography variant="body1">
                            <strong>Ground
                                Level:</strong> {forecastLatLongResponse.list[index].main.grnd_level} hPa
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
            </>
        );
    }
);

export default ForecastDashboard;
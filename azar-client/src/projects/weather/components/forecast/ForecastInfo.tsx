import React, {useContext, useEffect, useRef, useState} from "react";
import {getCardStyles} from "../../utils/weatherStyles.ts";
import {ThemeModeContext} from "../../../../theme/ThemeModeContext.tsx";
import {ForecastLatLongResponse} from "../../server/api/responses.ts";
import {getForecastByLatLong} from "../../server/api/weatherApi.ts";
import {Box, Button, IconButton, Modal, Tooltip, Typography} from "@mui/material";
import {ArrowBack, ArrowForward, Dashboard, ShowChart} from "@mui/icons-material";
import ForecastDashboard from "./ForecastDashboard.tsx";
import {ForecastChildComponentHandle} from "../../types/ChildComponent.types.ts";
import ForecastChart from "./ForecastChart.tsx";

interface ExtendedWeatherInfoProps {
    latitude: number;
    longitude: number;
    is12Hour: boolean;
    isCelsius: boolean;
    onClose: () => void;
}

export interface BaseForecastInfoChildProps {
    forecastLatLongResponse: ForecastLatLongResponse;
    onClose: () => void;
    is12HourInitial: boolean;
    isCelsiusInitial: boolean;
    setIsLeftArrowDisabled: (disabled: boolean) => void;
    setIsRightArrowDisabled: (disabled: boolean) => void;
    setLeftArrowTooltip: (tooltip: string) => void;
    setRightArrowTooltip: (tooltip: string) => void;
}

type ViewMode = "dashboard" | "chart";

const ForecastInfo: React.FC<ExtendedWeatherInfoProps> = ({latitude, longitude, is12Hour, isCelsius, onClose}) => {
    const [forecastLatLongResponse, setForecastLatLongResponse] = useState<ForecastLatLongResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [retry, setRetry] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
    const [isLeftArrowDisabled, setIsLeftArrowDisabled] = useState<boolean>();
    const [isRightArrowDisabled, setIsRightArrowDisabled] = useState<boolean>();
    const [leftArrowTooltip, setLeftArrowTooltip] = useState<string>("");
    const [rightArrowTooltip, setRightArrowTooltip] = useState<string>("");
    const childRef = useRef<ForecastChildComponentHandle>(null);

    const {mode} = useContext(ThemeModeContext);

    const onParentKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (childRef.current && typeof childRef.current.handleKeyDown === 'function') {
            childRef.current.handleKeyDown(event);
        }
    };

    const onLeftArrowClick = () => {
        if (childRef.current && typeof childRef.current.handleLeftArrowClick === "function") {
            childRef.current.handleLeftArrowClick();
        }
    };

    const onRightArrowClick = () => {
        if (childRef.current && typeof childRef.current.handleRightArrowClick === 'function') {
            childRef.current.handleRightArrowClick();
        }
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

    const dynamicStyles = getCardStyles(forecastLatLongResponse ? forecastLatLongResponse.list[0].weather[0].main : "", mode);

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
                            onKeyDown={onParentKeyDown}
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
                                sx={{
                                    position: "absolute",
                                    top: "8px",
                                    left: "8px",
                                    display: "flex",
                                    gap: "8px",
                                }}
                            >
                                <Tooltip
                                    title="Dashboard"
                                    disableInteractive
                                    componentsProps={{
                                        tooltip: {
                                            sx: {bgcolor: "primary.main", fontSize: "1rem"},
                                        },
                                    }}
                                >
                                    <IconButton color="primary" onClick={() => setViewMode("dashboard")}>
                                        <Dashboard fontSize="medium"/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    title="Show Chart"
                                    disableInteractive
                                    componentsProps={{
                                        tooltip: {
                                            sx: {bgcolor: "primary.main", fontSize: "1rem"},
                                        },
                                    }}
                                >
                                    <IconButton color="primary" onClick={() => setViewMode("chart")}>
                                        <ShowChart fontSize="medium"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box
                                onClick={(e) => {
                                    if (isLeftArrowDisabled) {
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
                                <Tooltip
                                    title={leftArrowTooltip}
                                    disableInteractive
                                    componentsProps={{
                                        tooltip: {
                                            sx: {bgcolor: "primary.main", fontSize: "1rem"},
                                        },
                                    }}
                                >
                                    <IconButton onClick={onLeftArrowClick}
                                                disabled={isLeftArrowDisabled}
                                                color="primary">
                                        <ArrowBack fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            {viewMode === "dashboard" ?
                                <ForecastDashboard
                                    forecastLatLongResponse={forecastLatLongResponse}
                                    onClose={onClose}
                                    is12HourInitial={is12Hour}
                                    isCelsiusInitial={isCelsius}
                                    setIsLeftArrowDisabled={setIsLeftArrowDisabled}
                                    setIsRightArrowDisabled={setIsRightArrowDisabled}
                                    setLeftArrowTooltip={setLeftArrowTooltip}
                                    setRightArrowTooltip={setRightArrowTooltip}
                                    ref={childRef}
                                />
                                :
                                <ForecastChart
                                    forecastLatLongResponse={forecastLatLongResponse}
                                    onClose={onClose}
                                    is12HourInitial={is12Hour}
                                    isCelsiusInitial={isCelsius}
                                    isLeftArrowDisabled={isLeftArrowDisabled}
                                    setIsLeftArrowDisabled={setIsLeftArrowDisabled}
                                    isRightArrowDisabled={isRightArrowDisabled}
                                    setIsRightArrowDisabled={setIsRightArrowDisabled}
                                    setLeftArrowTooltip={setLeftArrowTooltip}
                                    setRightArrowTooltip={setRightArrowTooltip}
                                    ref={childRef}
                                />
                            }

                            <Box
                                onClick={(e) => {
                                    if (isRightArrowDisabled) {
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
                                <Tooltip
                                    title={rightArrowTooltip}
                                    disableInteractive
                                    componentsProps={{
                                        tooltip: {
                                            sx: {bgcolor: "primary.main", fontSize: "1rem"},
                                        },
                                    }}
                                >
                                    <IconButton
                                        onClick={onRightArrowClick}
                                        disabled={isRightArrowDisabled}
                                        color="primary"
                                    >
                                        <ArrowForward fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Modal>
                )
            }
        </>
    );
};

export default ForecastInfo;

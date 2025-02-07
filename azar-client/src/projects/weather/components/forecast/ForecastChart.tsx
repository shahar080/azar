import {BaseResponse} from "../../server/api/responses.ts";
import React, {forwardRef, useEffect, useImperativeHandle, useState,} from "react";
import {ForecastChildComponentHandle} from "../../types/ChildComponent.types.ts";
import {Box, Button, MenuItem, TextField, Tooltip, Typography,} from "@mui/material";
import TemperatureChart from "./charts/TemperatureChart.tsx";
import HumidityChart from "./charts/HumidityChart.tsx";
import WindChart from "./charts/WindChart.tsx";
import CloudCoverChart from "./charts/CloudCoverChart.tsx";
import {AvailableCharts} from "../../models/models.ts";
import {convertEpochToLocalDate} from "../../utils/sharedLogic.tsx";
import {AccessTime, AvTimer} from "@mui/icons-material";
import {BaseForecastInfoChildProps} from "./ForecastInfo.tsx";
import LevelsChart from "./charts/LevelsChart.tsx";
import PressureChart from "./charts/PressureChart.tsx";

interface ForecastChartProps extends BaseForecastInfoChildProps {
    is12HourInitial: boolean;
    isLeftArrowDisabled: boolean | undefined;
    isRightArrowDisabled: boolean | undefined;
}

export interface BaseForecastChartChildProps {
    currentDateData: BaseResponse[];
    is12Hour: boolean;
    shown: boolean;
}

const ForecastChart = forwardRef<ForecastChildComponentHandle, ForecastChartProps>(
    (props, ref) => {
        const {
            forecastLatLongResponse,
            onClose,
            is12HourInitial,
            isLeftArrowDisabled,
            setIsLeftArrowDisabled,
            isRightArrowDisabled,
            setIsRightArrowDisabled,
            setLeftArrowTooltip,
            setRightArrowTooltip
        } = props;

        const [currentChart, setCurrentChart] = useState<AvailableCharts>(AvailableCharts.TEMPERATURE_CHART);
        const [date, setDate] = useState<string>("");
        const [currentDateData, setCurrentDateData] = useState<BaseResponse[]>([]);
        const [nextDateData, setNextDateData] = useState<BaseResponse[]>();
        const [index, setIndex] = useState<number>(0);
        const [is12Hour, setIs12Hour] = useState<boolean>(is12HourInitial);

        const switchClockTime = () => {
            setIs12Hour((prev) => !prev);
        };

        const getFilteredDatesByIndex = (
            forecastList: BaseResponse[],
            index: number
        ) => {
            const baseDate = new Date(forecastList[0].dt * 1000);
            const targetDate = new Date(baseDate);
            targetDate.setDate(baseDate.getDate() + index);

            const targetDateString = targetDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
            });

            return forecastList.filter((item) => {
                const itemDate = new Date(item.dt * 1000);
                const itemDateString = itemDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                });
                return itemDateString === targetDateString;
            });
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "ArrowLeft" && !isLeftArrowDisabled) {
                handleLeftArrowClick();
            } else if (e.key === "ArrowRight" && !isRightArrowDisabled) {
                handleRightArrowClick();
            }
        };

        const handleLeftArrowClick = () => {
            const updatedIndex = index - 1;
            if (updatedIndex < 0) {
                return;
            }
            setIndex(updatedIndex);
        }

        const handleRightArrowClick = () => {
            const updatedIndex = index + 1;
            setIndex(updatedIndex);
        }

        const chartComponents: Record<AvailableCharts, React.JSX.Element> = {
            [AvailableCharts.TEMPERATURE_CHART]: (
                <TemperatureChart
                    forecastLatLongResponse={forecastLatLongResponse}
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
            [AvailableCharts.HUMIDITY_CHART]: (
                <HumidityChart
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
            [AvailableCharts.LEVELS_CHART]: (
                <LevelsChart
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
            [AvailableCharts.WIND_CHART]: (
                <WindChart
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
            [AvailableCharts.PRESSURE_CHART]: (
                <PressureChart
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
            [AvailableCharts.CLOUD_COVER_CHART]: (
                <CloudCoverChart
                    currentDateData={currentDateData}
                    is12Hour={is12Hour}
                    shown={true}
                />
            ),
        };

        useEffect(() => {
            setLeftArrowTooltip("-1 Day");
            setRightArrowTooltip("+1 Day");
            setCurrentDateData(getFilteredDatesByIndex(forecastLatLongResponse.list, 0));
            setNextDateData(getFilteredDatesByIndex(forecastLatLongResponse.list, 1));
            setIsLeftArrowDisabled(index === 0);
        }, []);

        useEffect(() => {
            setIsLeftArrowDisabled(index === 0);
            const updatedCurrentDateData = getFilteredDatesByIndex(forecastLatLongResponse.list, index);
            setCurrentDateData(updatedCurrentDateData);
            const updatedNextDateData = getFilteredDatesByIndex(forecastLatLongResponse.list, index + 1);
            setNextDateData(updatedNextDateData);
            setDate(convertEpochToLocalDate(updatedCurrentDateData[0].dt, forecastLatLongResponse.city.timezone, undefined));
        }, [index]);

        useEffect(() => {
            setIsRightArrowDisabled(nextDateData?.length === 0);
        }, [nextDateData]);

        useImperativeHandle(ref, () => ({
            handleKeyDown,
            handleLeftArrowClick,
            handleRightArrowClick,
        }));

        return (
            <Box sx={{width: "100%"}}>
                <TextField
                    label="Chart"
                    name="chartType"
                    value={currentChart}
                    select
                    margin="normal"
                    onChange={event => {
                        const chosenChart = event.target.value as AvailableCharts;
                        setCurrentChart(chosenChart);
                    }}
                >
                    {Object.values(AvailableCharts).map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>
                <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
                    <Typography variant="h6" mr={"1vh"}>
                        {forecastLatLongResponse.city.name}, {forecastLatLongResponse.city.country}
                    </Typography>
                    <Typography variant="h6">
                        -
                    </Typography>
                    <Typography variant="h6" ml={"1vh"} mr={"1vh"}>
                        {date}
                    </Typography>
                    <Tooltip
                        title={`Click me to switch to ${
                            is12Hour ? "24 hours" : "12 hours"
                        } format`}
                        componentsProps={{
                            tooltip: {
                                sx: {
                                    bgcolor: 'primary.main',
                                    fontSize: '1rem',
                                },
                            },
                        }}
                    >
                        {is12Hour ? (
                            <AccessTime onClick={switchClockTime}/>
                        ) : (
                            <AvTimer onClick={switchClockTime}/>
                        )}
                    </Tooltip>
                </Box>
                {chartComponents[currentChart]}
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                    }}
                >
                    Close
                </Button>
            </Box>
        )
            ;
    }
);

export default ForecastChart;

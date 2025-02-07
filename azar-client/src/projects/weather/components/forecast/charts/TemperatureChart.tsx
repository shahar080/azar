import React, {useState} from "react";
import {ForecastLatLongResponse} from "../../../server/api/responses.ts";
import {formatEpoch, getTemperature, isEpochToday} from "../../../utils/sharedLogic.tsx";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";

interface TemperatureChartProps extends BaseForecastChartChildProps {
    forecastLatLongResponse: ForecastLatLongResponse;
    isCelsius: boolean;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({
                                                               forecastLatLongResponse,
                                                               currentDateData,
                                                               is12Hour,
                                                               isCelsius,
                                                               shown,
                                                           }) => {
    const tempSeries: Series = {
        label: "Temperature",
        data: currentDateData.map((item) => getTemperature(item.main.temp, isCelsius)),
        color: "#8884d8",
    };

    const feelsLikeSeries: Series = {
        label: "Feels Like",
        data: currentDateData.map((item) => getTemperature(item.main.feels_like, isCelsius)),
        color: "#82ca9d",
    };

    const tempMinSeries: Series = {
        label: "Min Temp",
        data: currentDateData.map((item) => getTemperature(item.main.temp_min, isCelsius)),
        color: "#ff7300",
    };

    const tempMaxSeries: Series = {
        label: "Max Temp",
        data: currentDateData.map((item) => getTemperature(item.main.temp_max, isCelsius)),
        color: "#ff0000",
    };

    const toggleableSeriesData: Series[] = [
        tempSeries,
        feelsLikeSeries,
        tempMinSeries,
        tempMaxSeries,
    ];

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Temperature": true,
        "Feels Like": true,
        "Min Temp": false,
        "Max Temp": false,
    });

    const getAverageTemp = (list: { main: { temp: number } }[]): number =>
        list.length ? list.reduce((acc, item) => acc + getTemperature(item.main.temp, isCelsius), 0) / list.length : 0;

    const sunriseSeries: Series = {
        label: "Sunrise",
        data: new Array(currentDateData.length).fill(null),
        color: "orange",
    };
    const sunsetSeries: Series = {
        label: "Sunset",
        data: new Array(currentDateData.length).fill(null),
        color: "purple",
    };

    let sunriseIndex: number | null = null;
    let sunsetIndex: number | null = null;
    const sunrise = forecastLatLongResponse.city?.sunrise;
    const sunset = forecastLatLongResponse.city?.sunset;

    const avgTemp = getAverageTemp(currentDateData);

    if (sunrise && currentDateData.length && isEpochToday(currentDateData[0].dt)) {
        let minDiff = Infinity;
        currentDateData.forEach((item, index) => {
            const diff = Math.abs(item.dt - sunrise);
            if (diff < minDiff) {
                minDiff = diff;
                sunriseIndex = index;
            }
        });
        if (sunriseIndex !== null) {
            sunriseSeries.data[sunriseIndex] = avgTemp;
            sunriseSeries.label = `Sunrise (${formatEpoch(sunrise, is12Hour)})`;
        }
    }

    if (sunset && currentDateData.length > 0 && isEpochToday(currentDateData[0].dt)) {
        let minDiff = Infinity;
        currentDateData.forEach((item, index) => {
            const diff = Math.abs(item.dt - sunset);
            if (diff < minDiff) {
                minDiff = diff;
                sunsetIndex = index;
            }
        });
        if (sunsetIndex !== null) {
            sunsetSeries.data[sunsetIndex] = avgTemp;
            sunsetSeries.label = `Sunset (${formatEpoch(sunset, is12Hour)})`;
        }
    }

    // todo AZAR-125 causes first day graph be higher than others
    const extraSeries: Series[] = [];
    if (sunrise && sunriseIndex !== null) extraSeries.push(sunriseSeries);
    if (sunset && sunsetIndex !== null) extraSeries.push(sunsetSeries);
    const finalSeries = [...toggleableSeriesData, ...extraSeries];

    return (
        <BaseChart
            shown={shown}
            seriesData={finalSeries}
            visibleSeries={visibleSeries}
            setVisibleSeries={setVisibleSeries}
            currentDateData={currentDateData}
            is12Hour={is12Hour}
        />
    );
};

export default TemperatureChart;

import React, {useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";

// todo AZAR-124 Arrow markers or a radar chart to indicate wind direction over time.

const WindChart: React.FC<BaseForecastChartChildProps> = ({
                                                              currentDateData,
                                                              is12Hour,
                                                              shown,
                                                          }) => {
    const windSpeedSeries: Series = {
        label: "Speed",
        data: currentDateData.map((item) => item.wind.speed),
        color: "#8884d8",
    };

    const windGustSeries: Series = {
        label: "Gust",
        data: currentDateData.map((item) => item.wind.gust),
        color: "#ff7300",
    };

    const seriesData: Series[] = [
        windSpeedSeries,
        windGustSeries,
    ];

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Speed": true,
        "Direction": false,
        "Gust": false,
    });

    return (
        <BaseChart
            shown={shown}
            seriesData={seriesData}
            visibleSeries={visibleSeries}
            setVisibleSeries={setVisibleSeries}
            currentDateData={currentDateData}
            is12Hour={is12Hour}
        />
    );
};

export default WindChart;

import React, {useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";

const LevelsChart: React.FC<BaseForecastChartChildProps> = ({
                                                                currentDateData,
                                                                is12Hour,
                                                                shown
                                                            }) => {
    const seaSeries: Series = {
        label: "Sea",
        data: currentDateData.map((item) => item.main.sea_level),
        color: "#8884d8",
    };

    const groundSeries: Series = {
        label: "Ground",
        data: currentDateData.map((item) => item.main.grnd_level),
        color: "#82ca9d",
    };

    const seriesData: Series[] = [
        seaSeries,
        groundSeries,
    ];

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Sea": true,
        "Ground": true,
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
}

export default LevelsChart;
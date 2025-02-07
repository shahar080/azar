import React, {useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";

const PressureChart: React.FC<BaseForecastChartChildProps> = ({
                                                                  currentDateData,
                                                                  is12Hour,
                                                                  shown
                                                              }) => {
    const pressureSeries: Series = {
        label: "Pressure",
        data: currentDateData.map((item) => item.main.pressure),
        color: "#8884d8",
    };

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Pressure": true,
    });

    return (
        <BaseChart
            shown={shown}
            seriesData={[pressureSeries]}
            visibleSeries={visibleSeries}
            setVisibleSeries={setVisibleSeries}
            currentDateData={currentDateData}
            is12Hour={is12Hour}
        />
    );
};

export default PressureChart;
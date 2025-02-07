import React, {useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";

const HumidityChart: React.FC<BaseForecastChartChildProps> = ({
                                                                  currentDateData,
                                                                  is12Hour,
                                                                  shown
                                                              }) => {
    const humiditySeries: Series = {
        label: "Humidity",
        data: currentDateData.map((item) => item.main.humidity),
        color: "#8884d8",
    };

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Humidity": true,
    });

    return (
        <BaseChart
            shown={shown}
            seriesData={[humiditySeries]}
            visibleSeries={visibleSeries}
            setVisibleSeries={setVisibleSeries}
            currentDateData={currentDateData}
            is12Hour={is12Hour}
        />
    );
}

export default HumidityChart;
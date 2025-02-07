import React, {useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseForecastChartChildProps} from "../ForecastChart.tsx";
import BaseChart from "./BaseChart.tsx";


const CloudCoverChart: React.FC<BaseForecastChartChildProps> = ({
                                                                    currentDateData,
                                                                    is12Hour,
                                                                    shown,
                                                                }) => {
    const cloudSeries: Series = {
        label: "Cover",
        data: currentDateData.map((item) => item.clouds.all),
        color: "#8884d8",
    };

    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({
        "Cover": true,
    });

    return (
        <BaseChart
            shown={shown}
            seriesData={[cloudSeries]}
            visibleSeries={visibleSeries}
            setVisibleSeries={setVisibleSeries}
            currentDateData={currentDateData}
            is12Hour={is12Hour}
        />
    );
};

export default CloudCoverChart;

import {Box, Checkbox, FormControlLabel, FormGroup} from "@mui/material";
import {LineChart} from "@mui/x-charts/LineChart";
import React, {useEffect, useRef, useState} from "react";
import {Series} from "../../../models/models.ts";
import {BaseResponse} from "../../../server/api/responses.ts";
import {formatEpoch} from "../../../utils/sharedLogic.tsx";

interface BaseChartProps {
    shown: boolean;
    seriesData: Series[];
    visibleSeries: Record<string, boolean>;
    setVisibleSeries: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    currentDateData: BaseResponse[];
    is12Hour: boolean;
}

const BaseChart: React.FC<BaseChartProps> = ({
                                                 shown, seriesData, visibleSeries, setVisibleSeries, currentDateData,
                                                 is12Hour
                                             }) => {
    const filteredSeries = seriesData.filter((s) => visibleSeries[s.label]);

    const xAxisLabels = currentDateData.map((item) => formatEpoch(item.dt, is12Hour));

    const handleToggle = (label: string) => {
        setVisibleSeries((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState<number>(600);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setChartWidth(containerRef.current.clientWidth);
            }
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const chartHeight = Math.max(chartWidth * 0.66, 300);

    console.log(seriesData);
    console.log(visibleSeries)
    return (
        <Box hidden={!shown} sx={{width: "100%"}}>
            <FormGroup row>
                {seriesData.map((s) => (
                    <FormControlLabel
                        key={s.label}
                        control={
                            <Checkbox
                                checked={visibleSeries[s.label]}
                                onChange={() => handleToggle(s.label)}
                                icon={
                                    <span
                                        style={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: s.color,
                                            display: "inline-block",
                                        }}
                                    />
                                }
                                checkedIcon={
                                    <span
                                        style={{
                                            width: 18,
                                            height: 18,
                                            backgroundColor: s.color,
                                            borderRadius: "4px",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                            <span
                                                style={{
                                                    color: "white",
                                                    fontSize: "1rem",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                            ✓
                                            </span>
                                        </span>
                                }
                            />
                        }
                        label={s.label}
                    />
                ))}
            </FormGroup>

            <Box
                ref={containerRef}
                sx={{width: "100%", maxWidth: "100%", position: "relative", height: chartHeight}}
            >
                <LineChart
                    xAxis={[
                        {
                            id: "x-axis",
                            scaleType: "band",
                            data: xAxisLabels,
                            tickLabelStyle: {
                                fontSize: '10px',
                            }

                        },
                    ]}
                    series={filteredSeries}
                    width={chartWidth}
                    height={chartHeight}
                    slotProps={{
                        legend: {hidden: true},
                    }}
                />
            </Box>
        </Box>
    );

}
export default BaseChart;
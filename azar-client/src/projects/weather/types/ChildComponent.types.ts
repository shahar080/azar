import {KeyboardEvent} from "react";

export interface ForecastChildComponentHandle {
    handleLeftArrowClick: () => void;
    handleRightArrowClick: () => void;
    handleKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}
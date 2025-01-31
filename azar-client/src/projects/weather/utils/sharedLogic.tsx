import {Cloud, Grain, Thunderstorm, WbSunny} from "@mui/icons-material";


export const getWeatherIcon = (main: string) => {
    switch (main) {
        case "Clear":
            return <WbSunny fontSize="large"/>;
        case "Clouds":
            return <Cloud fontSize="large"/>;
        case "Rain":
            return <Grain fontSize="large"/>;
        case "Thunderstorm":
            return <Thunderstorm fontSize="large"/>;
        default:
            return <WbSunny fontSize="large"/>;
    }
};
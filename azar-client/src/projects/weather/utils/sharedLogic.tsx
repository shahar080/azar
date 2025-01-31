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

export const convertEpochToLocalTime = (epoch: number, timezoneOffset: number, to12Hour: boolean): string => {
    const utcDate = new Date(epoch * 1000);

    // Manually apply timezone offset
    const localHours = (utcDate.getUTCHours() + timezoneOffset / 3600) % 24;
    const minutes = utcDate.getUTCMinutes();
    const seconds = utcDate.getUTCSeconds();

    if (to12Hour) {
        const amPm = localHours >= 12 ? "PM" : "AM";
        const formattedHours = localHours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${amPm}`;
    } else {
        return `${localHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
};

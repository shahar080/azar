import {Cloud, Grain, Thunderstorm, WbSunny} from "@mui/icons-material";
import {Endian, Locale} from "../models/models.ts";

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
    const localDate = new Date(utcDate.getTime() + timezoneOffset * 1000);

    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const seconds = localDate.getSeconds();

    if (to12Hour) {
        const amPm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${amPm}`;
    } else {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
};


export const convertEpochToLocalDate = (epoch: number, timezoneOffset: number, locale: Locale | undefined): string => {
    const date = new Date((epoch + timezoneOffset) * 1000);

    return new Intl.DateTimeFormat(locale?.toString() || "en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
};

export const formatEpoch = (dt: number, is12Hour: boolean): string =>
    new Date(dt * 1000)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: is12Hour,
        })

export function getEndianFromLocale(locale: Locale): Endian {
    switch (locale) {
        case Locale.LITTLE_ENDIAN:
            return Endian.LITTLE;
        case Locale.MIDDLE_ENDIAN:
            return Endian.MIDDLE;
        case Locale.BIG_ENDIAN:
            return Endian.BIG;
        default:
            return Endian.LITTLE;
    }
}

export const isEpochToday = (epoch: number): boolean => {
    const date = new Date(epoch * 1000);
    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};
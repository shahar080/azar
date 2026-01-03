export interface LatLongCoord {
    lon: number;
    lat: number;
}

export interface LatLongWeatherObject {
    id: number;
    main: string;
    description: string;
    icon: string;
}

export interface LatLongMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level: number;
    grnd_level: number;
}

export interface LatLongWind {
    speed: number;
    deg: number;
    gust: number;
}

export interface LatLongClouds {
    all: number;
}

export interface LatLongSys {
    country: string;
    sunrise: number;
    sunset: number;
}

export interface DBWeatherLocation {
    id: number;
    name: string;
    country: string;
    latitude: number;
    longitude: number;
}

export interface ForecastCity {
    id: number;
    name: string;
    coord: LatLongCoord;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export enum Locale {
    LITTLE_ENDIAN = "en-GB", // Day/Month/Year
    MIDDLE_ENDIAN = "en-US", // Month/Day/Year
    BIG_ENDIAN = "ja-JP", // Year/Month/Day
}

export enum Endian {
    LITTLE = "Little endian",
    MIDDLE = "Middle endian",
    BIG = "Big endian",
}

export enum AvailableCharts {
    TEMPERATURE_CHART = "Temperature",
    HUMIDITY_CHART = "Humidity",
    WIND_CHART = "Wind",
    CLOUD_COVER_CHART = "Cloud Cover",
    PRESSURE_CHART = "Pressure",
    LEVELS_CHART = "Levels",
}

export interface Series {
    label: string;
    data: (number | null)[];
    color: string;
}
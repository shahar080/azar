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

export interface WeatherLocation {
    name: string;
    latitude: string;
    longitude: string;
}
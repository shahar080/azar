package azar.weather.entities.external.api.open_weather_map.lat_long_response;

import azar.weather.entities.external.api.open_weather_map.lat_long_response.inner_objects.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LatLongResponse {
    private LatLongCoord coord;
    private List<LatLongWeatherObject> weather;
    private String base;
    private LatLongMain main;
    private Integer visibility;
    private LatLongWind wind;
    private LatLongClouds clouds;
    private Long dt;
    private LatLongSys sys;
    private Integer timezone;
    private Integer id;
    private String name;
    private Integer cod;
}

package azar.weather.entities.external.api.open_weather_map.shared.base;

import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongClouds;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongMain;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongWeatherObject;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongWind;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   02/02/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OWMBaseResponse {
    private List<OWMLatLongWeatherObject> weather;
    private OWMLatLongMain main;
    private Integer visibility;
    private OWMLatLongWind wind;
    private OWMLatLongClouds clouds;
    private Long dt;
}

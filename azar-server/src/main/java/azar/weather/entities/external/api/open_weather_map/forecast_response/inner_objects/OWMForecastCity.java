package azar.weather.entities.external.api.open_weather_map.forecast_response.inner_objects;

import azar.weather.entities.external.api.open_weather_map.shared.base.OWMLatLongCoord;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OWMForecastCity {
    private Integer id;
    private String name;
    private OWMLatLongCoord coord;
    private String country;
    private Integer population;
    private Integer timezone;
    private Integer sunrise;
    private Integer sunset;
}

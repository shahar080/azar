package azar.weather.entities.external.api.open_weather_map.lat_long_response.inner_objects;

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
public class OWMLatLongSys {
    private String country;
    private Long sunrise;
    private Long sunset;
}

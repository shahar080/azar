package azar.weather.entities.external.api.open_weather_map.lat_long_response;

import azar.weather.entities.external.api.open_weather_map.lat_long_response.inner_objects.OWMLatLongSys;
import azar.weather.entities.external.api.open_weather_map.shared.base.OWMBaseResponse;
import azar.weather.entities.external.api.open_weather_map.shared.base.OWMLatLongCoord;
import io.quarkus.runtime.annotations.RegisterForReflection;
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
@RegisterForReflection
public class OWMLatLongResponse extends OWMBaseResponse {
    private OWMLatLongCoord coord;
    private String base;
    private OWMLatLongSys sys;
    private Integer timezone;
    private Integer id;
    private String name;
    private Integer cod;
}

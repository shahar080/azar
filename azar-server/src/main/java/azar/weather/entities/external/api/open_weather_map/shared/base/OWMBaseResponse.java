package azar.weather.entities.external.api.open_weather_map.shared.base;

import java.util.List;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongClouds;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongMain;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongWeatherObject;
import azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects.OWMLatLongWind;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   02/02/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class OWMBaseResponse {
    private List<OWMLatLongWeatherObject> weather;
    private OWMLatLongMain main;
    private Integer visibility;
    private OWMLatLongWind wind;
    private OWMLatLongClouds clouds;
    private Long dt;
}

package azar.weather.entities.external.api.open_weather_map.shared.base;

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
public class OWMLatLongCoord {
    private Double lon;
    private Double lat;
}

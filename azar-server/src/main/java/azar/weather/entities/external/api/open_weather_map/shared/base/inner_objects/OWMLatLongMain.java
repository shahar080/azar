package azar.weather.entities.external.api.open_weather_map.shared.base.inner_objects;

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
public class OWMLatLongMain {
    private Double temp;
    private Double feels_like;
    private Double temp_min;
    private Double temp_max;
    private Integer pressure;
    private Integer humidity;
    private Integer sea_level;
    private Integer grnd_level;
}

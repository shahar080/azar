package azar.weather.entities.db;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class WeatherCoords {

    private String lon;

    private String lat;
}

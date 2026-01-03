package azar.weather.entities.db;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TempWeatherCity {

    private Integer id;

    private String name;

    private String state;

    private String country;

    private WeatherCoords coord;
}

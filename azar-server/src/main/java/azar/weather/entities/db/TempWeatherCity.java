package azar.weather.entities.db;

import jakarta.persistence.*;
import lombok.*;

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

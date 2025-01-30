package azar.weather.entities.db;

import jakarta.persistence.Column;
import lombok.*;

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

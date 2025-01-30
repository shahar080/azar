package azar.weather.entities.db;

import jakarta.persistence.*;
import lombok.*;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@Entity
@Table(
        name = "weather_cities",
        indexes = {
                @Index(name = "idx_weather_cities_name", columnList = "name")
        }
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class WeatherCity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @Column(name = "name", nullable = false)
    private String name;

    @Setter
    @Column(name = "country", nullable = false)
    private String country;

    @Setter
    @Column(name = "latitude", nullable = false)
    private String latitude;

    @Setter
    @Column(name = "longitude", nullable = false)
    private String longitude;
}

package azar.weather.entities.db;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
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
public class WeatherCity extends PanacheEntityBase {

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

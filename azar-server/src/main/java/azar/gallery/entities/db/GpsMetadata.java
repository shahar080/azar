package azar.gallery.entities.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@Entity
@Table(name = "gps_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class GpsMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(name = "latitude", precision = 10)
    private Double latitude;

    @Setter
    @Column(name = "longitude", precision = 10)
    private Double longitude;

    @Setter
    @Column(name = "altitude")
    private Double altitude;

    @Setter
    @Column(name = "city")
    private String city;

    @Setter
    @Column(name = "country")
    private String country;

    @PrePersist
    protected void onCreate() {
        if (latitude == null) {
            latitude = 0.0;
        }

        if (longitude == null) {
            longitude = 0.0;
        }

        if (altitude == null) {
            altitude = 0.0;
        }
    }
}
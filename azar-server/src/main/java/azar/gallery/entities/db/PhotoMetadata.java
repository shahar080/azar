package azar.gallery.entities.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@Entity
@Table(name = "photo_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PhotoMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_height")
    private String imageHeight;

    @Column(name = "image_width")
    private String imageWidth;

    @Column(name = "camera_make")
    private String cameraMake;

    @Column(name = "camera_model")
    private String cameraModel;

    @Column(name = "date_taken")
    private Instant dateTaken;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "photo_metadata_id", referencedColumnName = "id")
    private GpsMetadata gps;
}

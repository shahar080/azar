package azar.gallery.entities.db;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@Entity
@Table(name = "Photos")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", nullable = false)
    private String description;

    @Setter
    @Lob
    @Column(name = "data", nullable = false)
    private byte[] data;

    @Setter
    @Lob
    @Column(name = "thumbnail", nullable = false)
    private byte[] thumbnail;

    @Column(name = "size", nullable = false)
    private String size;

    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Setter
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "metadata_id", referencedColumnName = "id")
    private PhotoMetadata photoMetadata;

    @PrePersist
    protected void onCreate() {
        uploadedAt = Instant.now();
    }

}

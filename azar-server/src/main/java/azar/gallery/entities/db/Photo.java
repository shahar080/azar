package azar.gallery.entities.db;

import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@Entity
@Table(name = "Photos")
@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Photo extends PanacheEntityBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @Column(name = "name", nullable = false)
    private String name;

    @Setter
    @Column(name = "description", nullable = false, length = 1_000)
    private String description;

    @Setter
    @Lob
    @Column(name = "data", columnDefinition = "bytea", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.ARRAY)
    private byte[] data;

    @Setter
    @Lob
    @Column(name = "thumbnail", columnDefinition = "bytea", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.ARRAY)
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

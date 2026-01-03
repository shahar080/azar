package azar.cloud.entities.db;

import java.time.Instant;
import java.util.List;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@Entity
@Table(name = "pdf_files")
@Getter
@Setter
public class PdfFile extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String uploadedBy;

    @Column(nullable = false)
    private String fileName;

    @Lob
    @Column(nullable = false)
    private byte[] data;

    private String contentType;

    @Column(nullable = false)
    private List<String> labels;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private Instant uploadedAt;

    @Column
    private String description;

    @Lob
    @Column(nullable = false)
    private byte[] thumbnail;

    @PrePersist
    protected void onCreate() {
        uploadedAt = Instant.now();
    }

}

package azar.entities.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 * Purpose: //TODO add purpose for class PdfFile
 **/
@Entity
@Table(name = "pdf_files")
@Getter
@Setter
public class PdfFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Lob
    @Column(nullable = false)
    private byte[] data;

    private String contentType; // For MIME type

    @Column(nullable = false)
    private List<String> labels;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private Instant uploadedAt;

    @Column
    private String description;

    @PrePersist
    protected void onCreate() {
        uploadedAt = Instant.now(); // Set current time before persisting
    }

}
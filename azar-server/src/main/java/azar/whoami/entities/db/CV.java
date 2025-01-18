package azar.whoami.entities.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Entity
@Table(name = "cv")
@Getter
@Setter
public class CV {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Lob
    @Column(nullable = false)
    private byte[] data;
}

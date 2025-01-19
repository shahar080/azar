package azar.whoami.entities.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
@Entity
@Table(name = "email")
@Getter
@Setter
public class EmailData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", nullable = false)
    private String body;
}

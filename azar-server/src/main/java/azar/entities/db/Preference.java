package azar.entities.db;

import jakarta.persistence.*;
import lombok.*;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Entity
@Table(name = "Preferences")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "key", nullable = false, unique = true)
    private String key;

    @Setter
    @Column(name = "value", nullable = false)
    private String value;

    @Column(name = "userId", nullable = false)
    private String userId;
}


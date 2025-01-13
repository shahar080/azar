package azar.entities.db;

import jakarta.persistence.*;
import lombok.*;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Entity
@Table(
        name = "Preferences",
        uniqueConstraints = @UniqueConstraint(columnNames = {"key", "user_id"})
)
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @Column(name = "key", nullable = false)
    private String key;

    @Setter
    @Column(name = "value", nullable = false)
    private String value;

    @Setter
    @Column(name = "user_id", nullable = false)
    private String userId;
}


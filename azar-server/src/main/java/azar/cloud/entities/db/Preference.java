package azar.cloud.entities.db;

import azar.shared.entities.db.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
public class Preference extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Setter
    @Column(name = "key", nullable = false)
    private String key;

    @Setter
    @Column(name = "value", nullable = false)
    private String value;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @Setter
    @ToString.Exclude
    @JsonIgnore
    private User user;

}


package azar.shared.entities.db;

import jakarta.persistence.*;
import lombok.*;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@Entity
@Table(name = "Users")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "user_name", unique = true, nullable = false, updatable = false)
    private String userName;

    @Setter
    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)  // Use STRING to store enum names in the DB
    @Column(name = "user_type", nullable = false)
    private UserType userType = UserType.STANDARD;

    public boolean IsNonAdmin() {
        return !this.userType.equals(UserType.ADMIN);
    }
}


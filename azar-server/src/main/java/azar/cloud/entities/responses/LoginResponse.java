package azar.cloud.entities.responses;

import azar.shared.entities.db.UserType;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class LoginResponse {
    private boolean success;

    private String token;

    private String userName;

    private UserType userType;

    private Integer userId;
}
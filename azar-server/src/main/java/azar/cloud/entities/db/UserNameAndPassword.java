package azar.cloud.entities.db;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNameAndPassword {
    private String userName;
    private String password;
}

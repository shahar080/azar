package azar.entities.db;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class UserNameAndPassword
 **/
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNameAndPassword {
    private String userName;
    private String password;
}

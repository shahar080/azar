package azar.shared.entities.db;

import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
@Getter
public enum UserType {
    ADMIN("ADMIN"),
    STANDARD("STANDARD");

    private final String type;

    UserType(String type) {
        this.type = type;
    }

}



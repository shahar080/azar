package azar.cloud.entities.db;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
public enum UserType {
    ADMIN("ADMIN"),
    STANDARD("STANDARD");

    private final String type;

    UserType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}



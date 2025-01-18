package azar.cloud.entities.responses;

import azar.shared.entities.db.UserType;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
public record LoginResponse(boolean success, String token, String userName, UserType userType, Integer userId) {
}
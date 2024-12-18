package azar.entities;

import azar.entities.db.UserType;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 * Purpose: //TODO add purpose for class LoginResponse
 **/
public record LoginResponse(boolean success, String token, String userName, UserType userType) {
}
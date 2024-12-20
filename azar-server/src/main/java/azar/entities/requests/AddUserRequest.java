package azar.entities.requests;

import azar.entities.db.User;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
public record AddUserRequest(String currentUser, User userToAdd) {
}

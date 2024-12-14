package azar.entities.requests;

import azar.entities.db.User;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 * Purpose: //TODO add purpose for class AddUser
 **/
public record AddUserRequest(String currentUser, User userToAdd) {
}

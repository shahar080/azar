package azar.cloud.utils;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
public class PasswordManager {
    // Hash password before storing in the database
    public String hashPassword(String password) {
        int saltRounds = 10;
        return BCrypt.hashpw(password, BCrypt.gensalt(saltRounds));
    }

    // Compare entered password with stored hash
    public boolean checkPassword(String enteredPassword, String storedHash) {
        return BCrypt.checkpw(enteredPassword, storedHash);
    }
}

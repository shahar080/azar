package azar.cloud.utils;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@ApplicationScoped
public class PasswordManager {
    public String hashPassword(String password) {
        int saltRounds = 10;
        return BCrypt.hashpw(password, BCrypt.gensalt(saltRounds));
    }

    public boolean checkPassword(String enteredPassword, String storedHash) {
        return BCrypt.checkpw(enteredPassword, storedHash);
    }
}

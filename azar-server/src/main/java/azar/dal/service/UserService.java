package azar.dal.service;

import azar.dal.dao.UserDao;
import azar.entities.db.User;
import azar.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Future;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class UserService extends GenericService<User> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    private UserDao userDao;

    @Inject
    private JsonManager jsonManager;

    /**
     * A wrapper function to add a new user to the db
     *
     * @param newUser - the new user
     */
    @Override
    public Future<User> add(User newUser) {
        logger.info("Trying to add user with username: {}", newUser.getUserName());
        return userDao.add(newUser);
    }

    /**
     * A wrapper function to update a user in the db
     *
     * @param updatedUser - the updated user
     */
    @Override
    public Future<User> update(User updatedUser) {
        logger.info("Trying to update user with username: {}", updatedUser.getUserName());
        return userDao.update(updatedUser);
    }

    /**
     * A wrapper function to remove a given user from the db using a {@link User}
     *
     * @param user - the given user
     */
    @Override
    public Future<Boolean> remove(User user) {
        logger.info("Removing user from users db with the username: {}", user.getUserName());
        return userDao.remove(user);
    }

    /**
     * A wrapper function to remove a given user from the db using users' id
     *
     * @param id - the given users' id
     */
    @Override
    public Future<Boolean> removeById(Integer id) {
        logger.info("Removing user from the users db with the id: {}", id);
        return userDao.removeById(id);
    }

    /**
     * A wrapper function to get a user by id from the db
     *
     * @param id - the users' id
     * @return the user if found, else, null
     */
    @Override
    public Future<User> getById(Integer id) {
        logger.info("Trying to return user with the id of: {}", id);
        return userDao.getById(id);
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     * @return the user if found, else, null
     */
    public Future<User> getUserByUserName(String userName) {
        logger.info("Returning user by userName: {}", userName);
        return userDao.getUserByUserName(userName);
    }

    /**
     * A wrapper function to get the users from db
     *
     * @return - the users map
     */
    @Override
    public Future<Set<User>> getAll() {
        logger.info("Returning all users.");
        return userDao.getAll();
    }

    public boolean isInvalidUser(User user) {
        return user == null || user.getFirstName() == null ||
                user.getLastName() == null || user.getUserName() == null ||
                user.getPassword() == null;
    }

    public Future<List<User>> getAllClientPaginated(int offset, int limit) {
        return userDao.getAllClientPaginated(offset, limit);
    }

    @Override
    public String toString() {
        return jsonManager.toJson(this.getAll());
    }

}

package azar.shared.dal.service;

import java.util.List;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.dao.UserDao;
import azar.shared.entities.db.User;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@ApplicationScoped
public class UserService extends GenericService<User> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final UserDao userDao;

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    protected GenericDao<User> getDao() {
        return userDao;
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     *
     * @return the user if found, else, null
     */
    public User getUserByUserName(String userName) {
        logger.info("Returning user by userName: {}", userName);
        return userDao.getUserByUserName(userName);
    }

    public boolean isInvalidUser(User user) {
        return user == null || user.getFirstName() == null ||
                user.getLastName() == null || user.getUserName() == null ||
                user.getPassword() == null;
    }

    public List<User> getAllClientPaginated(int offset, int limit) {
        return userDao.getAllPaginated(offset, limit);
    }

    public boolean isAdmin(String userName) {
        return userDao.isAdmin(userName);
    }

}

package azar.dal.dao;

import azar.dal.entities.db.User;
import azar.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Future;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class UserDao
 **/
public class UserDao extends GenericDao<User> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    private JsonManager jsonManager;

    /**
     * A function to get all the users as a Map
     *
     * @return - the users map
     */
    @Override
    public Future<Set<User>> getAll() {
        logger.info("Trying to get all users from DB..");
        return super.getAll();
    }

    /**
     * A function to add a new user to the DB
     *
     * @param user - the new user
     * @return - true if added, else, false // TODO: 12/12/2024 SHAHAR-11
     */
    @Override
    public Future<User> add(User user) {
        logger.info("Starting to add user to the DB. user name: {}", user.getUserName());
        return super.add(createUserWithId(user));
    }

    private User createUserWithId(User user) {
        return User.builder()
                .id(getAvailableId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userName(user.getUserName())
                .password(user.getPassword())
                .build();
    }

    private Integer getAvailableId() {
        try (Session session = openSession()) {
            String hql = "FROM User U WHERE U.id = (SELECT max(id) from User )"; // TODO: 12/12/2024 SHAHAR-13
            Query<User> query = session.createQuery(hql, User.class);
            List<User> results = query.list();
            if (results.size() == 1) {
                closeSession();
                return results.getFirst().getId() + 1;
            } else {
                return 1;
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        closeSession();
        return null;
    }


    /**
     * A function to update an existing user
     *
     * @param newUser - the new user
     * @return - the updated user if succeeded, else, null
     */
    @Override
    public Future<User> update(User newUser) {
        logger.info("Trying to update user with id: {}", newUser.getId());
        return super.update(newUser);
    }

    /**
     * A function to get a user by id from the DB
     *
     * @param id - the users' id
     * @return the user if found, else, null
     */
    @Override
    public Future<User> getById(Integer id) {
        logger.info("Returning a user by given id: {}", id);
        return super.getById(id);
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     * @return the user if found, else, null
     */
    public Future<User> getUserByUserName(String userName) {
        logger.info("Returning user by userName: {}", userName);
        return Future.future(promise -> {
            try (Session session = openSession()) {
                String hql = "FROM User U WHERE U.userName = '" + userName + "'";
                Query<User> query = session.createQuery(hql, User.class);
                List<User> results = query.list();
                if (!results.isEmpty()) {
                    promise.complete(results.getFirst());
                } else {
                    logger.warn("User {} not found in DB!", userName);
                    promise.complete(null);
                }
            } catch (Exception e) {
                promise.fail(e.getMessage());
            }
            closeSession();
        });
    }

    /**
     * A function to remove a user from the DB
     *
     * @param user - the user to remove
     * @return - true if succeeded, else, false
     */
    @Override
    public Future<Boolean> remove(User user) {
        logger.info("Starting to remove user from DB. User id: {}", user.getId());
        return super.remove(user);
    }

    /**
     * A function to remove a given user from the DB using its id
     *
     * @param id - the users' id
     * @return - true if succeeded, else, false
     */
    @Override
    public Future<Boolean> removeById(Integer id) {
        logger.info("Trying to remove user from DB with id: {}", id);
        return super.removeById(id);
    }

    @Override
    protected Class<User> getType() {
        return User.class;
    }
}

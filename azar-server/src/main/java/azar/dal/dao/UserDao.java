package azar.dal.dao;

import azar.entities.db.User;
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
        return super.getAll();
    }

    /**
     * A function to add a new user to the DB
     *
     * @param user - the new user
     */
    @Override
    public Future<User> add(User user) {
        return super.add(user);
    }

    /**
     * A function to update an existing user
     *
     * @param newUser - the new user
     * @return - the updated user if succeeded, else, null
     */
    @Override
    public Future<User> update(User newUser) {
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
        return super.getById(id);
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     * @return the user if found, else, null
     */
    public Future<User> getUserByUserName(String userName) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                String hql = "FROM User U WHERE lower(U.userName) = lower(:userName)";
                Query<User> query = session.createQuery(hql, User.class);
                query.setParameter("userName", userName);
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
        return super.removeById(id);
    }

    public Future<List<User>> getAllClientPaginated(int offset, int limit) {
        return Future.future(listPromise -> {
            try (Session session = openSession()) {
                List<User> paginatedResults = session
                        .createQuery(
                                "FROM User",
                                User.class)
                        .setFirstResult(offset) // Offset
                        .setMaxResults(limit)   // Limit
                        .getResultList();

                listPromise.complete(paginatedResults);
            } catch (Exception e) {
                listPromise.fail(e);
            }
        });
    }

    @Override
    protected Class<User> getType() {
        return User.class;
    }
}

package azar.shared.dal.dao;

import azar.cloud.dal.dao.PreferencesDao;
import azar.cloud.entities.db.Preference;
import azar.shared.entities.db.User;
import azar.shared.entities.db.UserType;
import azar.shared.factory.SessionFactoryProvider;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.hibernate.query.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Objects;

import static azar.cloud.utils.Constants.DRAWER_PINNED;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@Singleton
public class UserDao extends GenericDao<User> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    private JsonManager jsonManager;

    @Inject
    private PreferencesDao preferencesDao;

    @Inject
    public UserDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    public Future<User> add(User user) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                super.add(user)
                        .onSuccess(dbUser -> {
                            Preference drawerPinned = new Preference();
                            drawerPinned.setKey(DRAWER_PINNED);
                            drawerPinned.setValue(String.valueOf(true));
                            drawerPinned.setUserId(String.valueOf(dbUser.getId()));
                            preferencesDao.add(drawerPinned)
                                    .onSuccess(_ -> {
                                        promise.complete(dbUser);
                                    })
                                    .onFailure(promise::fail);
                        })
                        .onFailure(promise::fail);
                return null;
            }, false);
        });
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                super.removeById(id)
                        .onSuccess(isDeleted -> {
                            if (isDeleted) {
                                preferencesDao.removeAllByUserId(String.valueOf(id))
                                        .onSuccess(promise::complete)
                                        .onFailure(promise::fail);
                            }
                        })
                        .onFailure(promise::fail);
                return null;
            }, false);
        });
    }

    /**
     * A wrapper function to get a user by userName from the db
     *
     * @param userName - the users' name
     * @return the user if found, else, null
     */
    public Future<User> getUserByUserName(String userName) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
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
                return null;
            }, false);
        });
    }

    public Future<Boolean> isAdmin(String userName) {
        return Future.future(pdfOwnerPromise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    String userType = session
                            .createNativeQuery(
                                    "SELECT u.user_type FROM users u WHERE u.user_name = :userName",
                                    String.class
                            )
                            .setParameter("userName", userName)
                            .getSingleResult();

                    pdfOwnerPromise.complete(Objects.equals(userType, UserType.ADMIN.getType()));
                } catch (Exception e) {
                    pdfOwnerPromise.fail(e);
                }
                return null;
            }, false);
        });
    }

    @Override
    protected Class<User> getType() {
        return User.class;
    }
}

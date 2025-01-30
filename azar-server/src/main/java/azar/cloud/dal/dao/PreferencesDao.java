package azar.cloud.dal.dao;

import azar.cloud.entities.db.Preference;
import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Singleton
public class PreferencesDao extends GenericDao<Preference> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    public PreferencesDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    public Future<Set<Preference>> getAllUsers(String userId) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                List<Preference> value = session
                        .createQuery(
                                "FROM Preference p WHERE p.userId = :userId",
                                Preference.class
                        )
                        .setParameter("userId", userId)
                        .getResultList();

                return new HashSet<>(value);
            } catch (Exception e) {
                logger.error("Could not get all users' preferences from db!", e);
            }
            return Collections.emptySet();
        }, false);
    }

    public Future<String> getValue(String key, String userId) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery(
                                "SELECT p.value FROM Preference p WHERE p.key = :key AND p.userId = :userId",
                                String.class
                        )
                        .setParameter("key", key)
                        .setParameter("userId", userId)
                        .getSingleResult();
            } catch (Exception e) {
                logger.error("Could not get preference value from db for key {} userId {}!", key, userId, e);
            }
            return "";
        }, false);
    }

    public Future<Boolean> getBooleanValue(String key, String userId) {
        return Future.future(booleanRes ->
                getValue(key, userId)
                        .onSuccess(value -> booleanRes.complete(Boolean.getBoolean(value)))
                        .onFailure(booleanRes::fail));
    }

    public Future<Preference> getByKey(String key, String userId) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery(
                                "SELECT p FROM Preference p WHERE p.key = :key AND p.userId = :userId",
                                Preference.class
                        )
                        .setParameter("key", key)
                        .setParameter("userId", userId)
                        .getSingleResult();
            } catch (Exception e) {
                logger.error("Could not get preference by key from db! key {} userId {}", key, userId, e);
            }
            return null;
        }, false);
    }

    public Future<Boolean> removeAllByUserId(String userId) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                try {
                    session.getTransaction().begin();
                    int deleted = session
                            .createMutationQuery(
                                    "DELETE FROM Preference p WHERE p.userId = :userId"
                            )
                            .setParameter("userId", userId)
                            .executeUpdate();
                    session.getTransaction().commit();
                    return deleted > 0;
                } catch (Exception e) {
                    if (session.getTransaction().isActive()) {
                        session.getTransaction().rollback();
                    }
                    logger.error("Could not remove preferences for user in db! userId {}", userId, e);
                }
            } catch (Exception e) {
                logger.error("Could not remove preferences for user in db! userId {}", userId, e);
            }
            return false;
        }, false);
    }

    @Override
    protected Class<Preference> getType() {
        return Preference.class;
    }
}

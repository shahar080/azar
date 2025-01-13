package azar.dal.dao;

import azar.entities.db.Preference;
import azar.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Singleton
public class PreferencesDao extends GenericDao<Preference> {

    @Inject
    public PreferencesDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    public Future<Set<Preference>> getAllUsers(String userId) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    try (Session session = openSession()) {
                        List<Preference> value = session
                                .createQuery(
                                        "FROM Preference p WHERE p.userId = :userId",
                                        Preference.class
                                )
                                .setParameter("userId", userId)
                                .getResultList();

                        getValuePromise.complete(new HashSet<>(value));
                    } catch (Exception e) {
                        getValuePromise.fail(e);
                    }
                    return null;
                }, false));
    }

    public Future<String> getValue(String key, String userId) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    try (Session session = openSession()) {
                        String value = session
                                .createQuery(
                                        "SELECT p.value FROM Preference p WHERE p.key = :key AND p.userId = :userId",
                                        String.class
                                )
                                .setParameter("key", key)
                                .setParameter("userId", userId)
                                .getSingleResult();

                        getValuePromise.complete(value);
                    } catch (Exception e) {
                        getValuePromise.fail(e);
                    }
                    return null;
                }, false));
    }

    public Future<Boolean> getBooleanValue(String key, String userId) {
        return Future.future(booleanRes ->
                getValue(key, userId)
                        .onSuccess(value -> booleanRes.complete(Boolean.getBoolean(value)))
                        .onFailure(booleanRes::fail));
    }

    public Future<Preference> getByKey(String key, String userId) {
        return Future.future(getByKeyPromise ->
                vertx.executeBlocking(() -> {
                    try (Session session = openSession()) {
                        Preference preference = session
                                .createQuery(
                                        "SELECT p FROM Preference p WHERE p.key = :key AND p.userId = :userId",
                                        Preference.class
                                )
                                .setParameter("key", key)
                                .setParameter("userId", userId)
                                .getSingleResult();

                        getByKeyPromise.complete(preference);
                    } catch (Exception e) {
                        getByKeyPromise.fail(e);
                    }
                    return null;
                }, false));
    }

    public Future<Boolean> removeAllByUserId(String userId) {
        return Future.future(getByKeyPromise ->
                vertx.executeBlocking(() -> {
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
                            getByKeyPromise.complete(deleted > 0);
                        } catch (Exception e) {
                            if (session.getTransaction().isActive()) {
                                session.getTransaction().rollback();
                            }
                            getByKeyPromise.fail(e);
                        }
                    } catch (Exception e) {
                        getByKeyPromise.fail(e);
                    }
                    return null;
                }, false));
    }

    @Override
    protected Class<Preference> getType() {
        return Preference.class;
    }
}

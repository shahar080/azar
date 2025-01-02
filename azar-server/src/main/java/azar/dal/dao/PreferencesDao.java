package azar.dal.dao;

import azar.entities.db.Preference;
import azar.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;

import java.util.List;

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

    public Future<String> getValue(String key) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    try (Session session = openSession()) {
                        String value = session
                                .createNativeQuery(
                                        "SELECT s.value FROM settings s WHERE s.key = :key",
                                        String.class
                                )
                                .setParameter("key", key)
                                .getSingleResult();

                        getValuePromise.complete(value);
                    } catch (Exception e) {
                        getValuePromise.fail(e);
                    }
                    return null;
                }, false));
    }

    public Future<Boolean> getBooleanValue(String key) {
        return Future.future(booleanRes ->
                getValue(key)
                        .onSuccess(value -> booleanRes.complete(Boolean.getBoolean(value)))
                        .onFailure(booleanRes::fail));
    }

    public Future<Preference> getByKey(String key) {
        return Future.future(getByKeyPromise ->
                vertx.executeBlocking(() -> {
                    try (Session session = openSession()) {
                        Preference preference = session
                                .createNativeQuery(
                                        "SELECT s FROM settings s WHERE s.key = :key",
                                        Preference.class
                                )
                                .setParameter("key", key)
                                .getSingleResult();

                        getByKeyPromise.complete(preference);
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

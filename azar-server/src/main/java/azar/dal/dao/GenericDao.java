package azar.dal.dao;

import azar.utils.Utilities;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: Generic Dao definition
 **/
public abstract class GenericDao<T> {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    protected SessionFactory sessionFactory;
    private Session currentSession;

    @Inject
    public GenericDao() {
        sessionFactory = new Configuration().configure().buildSessionFactory();
        currentSession = null;
    }

    protected Session openSession() {
        if (currentSession == null || !currentSession.isOpen()) {
            currentSession = sessionFactory.openSession();
        }
        return currentSession;
    }

    protected void closeSession() {
//        if (currentSession != null) {
//            currentSession.close();
//        }
//        currentSession = null;
    }

    public Future<Set<T>> getAll() {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                Class<T> type = this.getType();
                List<T> items = session.createQuery("from " + type.getName() + " s", type).getResultList();
                promise.complete(new HashSet<>(items));
            } catch (Exception e) {
                promise.fail(e);
            }
            closeSession();
        });
    }

    public Future<T> add(T t) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                T addedObj = session.merge(t);
                session.getTransaction().commit();
                promise.complete(addedObj);
            } catch (Exception e) {
                promise.fail(e);
                closeSession();
            }
        });
    }

    public Future<T> update(T newItem) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                // Fetch the existing entity by its ID
                Object id = session.getEntityManagerFactory()
                        .getPersistenceUnitUtil().getIdentifier(newItem);
                T existingItem = session.find((Class<T>) newItem.getClass(), id);

                if (existingItem == null) {
                    throw new IllegalArgumentException("Entity not found for update");
                }

                // Retain fields from the existing item
                Utilities.mergeNonNullFields(newItem, existingItem);

                // Merge the updated entity
                T res = session.merge(existingItem);
                session.getTransaction().commit();
                promise.complete(res);
            } catch (Exception e) {
                promise.fail(e);
                closeSession();
            }
        });
    }

    public Future<T> getById(Integer id) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                T res = session.get(this.getType(), id);
                session.getTransaction().commit();
                promise.complete(res);
            } catch (Exception e) {
                promise.fail(e);
            }
            closeSession();
        });
    }

    public Future<Boolean> remove(T t) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                session.remove(t);
                session.getTransaction().commit();
                promise.complete(true);
            } catch (Exception e) {
                promise.fail(e);
            }
            closeSession();
        });
    }

    public Future<Boolean> removeById(Integer id) {
        return Future.future(promise -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                session.remove(session.get(this.getType(), id));
                session.getTransaction().commit();
                promise.complete(true);
            } catch (Exception e) {
                promise.fail(e);
            }
            closeSession();
        });
    }

    protected abstract Class<T> getType();

}

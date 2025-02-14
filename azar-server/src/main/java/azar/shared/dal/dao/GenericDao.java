package azar.shared.dal.dao;

import azar.shared.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: Generic Dao definition
 **/
public abstract class GenericDao<T> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    protected final SessionFactory sessionFactory;
    protected final Vertx vertx;

    @Inject
    public GenericDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        sessionFactory = sessionFactoryProvider.getSessionFactory();
        this.vertx = vertx;
    }

    protected Session openSession() {
        return sessionFactory.openSession();
    }

    public Future<Set<T>> getAll() {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                Class<T> type = this.getType();
                List<T> items = session.createQuery("from " + type.getName() + " s", type).getResultList();
                return new HashSet<>(items);
            } catch (Exception e) {
                logger.error("Could not getAll from db! type: {}", getType(), e);
            }
            return Collections.emptySet();
        }, false);
    }

    public Future<List<T>> getAllPaginated(int offset, int limit, String whereClause) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery("from " + getType().getName() + " s " + whereClause, getType())
                        .setFirstResult(offset)
                        .setMaxResults(limit)
                        .getResultList();
            } catch (Exception e) {
                logger.error("Could not getAllPaginated from db! type: {}", getType(), e);
            }
            return new ArrayList<>();
        }, false);
    }

    public Future<T> add(T t) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                T addedObj = session.merge(t);
                session.getTransaction().commit();
                return addedObj;
            } catch (Exception e) {
                logger.error("Could not add in db! type: {}", getType(), e);
            }
            return null;
        }, false);
    }

    public Future<T> update(T newItem) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                T res = session.merge(newItem);

                session.getTransaction().commit();
                return res;
            } catch (Exception e) {
                logger.error("Could not update in db! type: {}", getType(), e);
            }
            return null;
        }, false);
    }


    public Future<T> getById(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                T res = session.get(this.getType(), id);
                session.getTransaction().commit();
                return res;
            } catch (Exception e) {
                logger.error("Could not getById from db! type: {} id: {}", getType(), id, e);
            }
            return null;
        }, false);
    }

    public Future<Boolean> remove(T t) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                session.remove(t);
                session.getTransaction().commit();
                return true;
            } catch (Exception e) {
                logger.error("Could not remove from db! type: {}", getType(), e);
            }
            return false;
        }, false);
    }

    public Future<Boolean> removeById(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();
                session.remove(session.get(this.getType(), id));
                session.getTransaction().commit();
                return true;
            } catch (Exception e) {
                logger.error("Could not removeById from db! type: {}, id: {}", getType(), id, e);
            }
            return false;
        }, false);
    }

    public Future<byte[]> getThumbnailById(String tableName, Integer id) {
        return vertx.executeBlocking(() -> {
            if (!hasThumbnail()) {
                logger.warn("getThumbnailById was called by unsupported type! {}", getType());
                return new byte[0];
            }
            try (Session session = openSession()) {
                String query = String.format(
                        "SELECT lo_get(p.thumbnail) FROM %s p WHERE p.id = :id",
                        tableName
                );

                return session.createNativeQuery(query, byte[].class)
                        .setParameter("id", id)
                        .getSingleResult();
            } catch (Exception e) {
                logger.error("Could not get thumbnail by id from table {}!", tableName, e);
            }
            return new byte[0];
        }, false);
    }

    protected boolean hasThumbnail() {
        return false;
    }

    protected abstract Class<T> getType();

}

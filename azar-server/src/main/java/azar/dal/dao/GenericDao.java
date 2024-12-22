package azar.dal.dao;

import azar.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
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
    protected SessionFactory sessionFactory;
    private Session currentSession;
    protected final Vertx vertx;

    @Inject
    public GenericDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        sessionFactory = sessionFactoryProvider.getSessionFactory();
        currentSession = null;
        this.vertx = vertx;
    }

    protected Session openSession() {
        if (currentSession == null || !currentSession.isOpen()) {
            currentSession = sessionFactory.openSession();
        }
        return currentSession;
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
        });
    }

    public Future<T> add(T t) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    session.beginTransaction();
                    T addedObj = session.merge(t);
                    session.getTransaction().commit();
                    promise.complete(addedObj);
                } catch (Exception e) {
                    promise.fail(e);
                }
                return null;
            });
        });
    }

    public Future<T> update(T newItem) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    session.beginTransaction();

                    T res = session.merge(newItem);

                    session.getTransaction().commit();
                    promise.complete(res);
                } catch (Exception e) {
                    promise.fail(e);
                }
                return null;
            });
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
        });
    }

    protected abstract Class<T> getType();

}

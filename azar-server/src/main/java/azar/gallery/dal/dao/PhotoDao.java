package azar.gallery.dal.dao;

import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import jakarta.persistence.TypedQuery;
import org.hibernate.Session;
import org.hibernate.query.MutationQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class PhotoDao extends GenericDao<Photo> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    public PhotoDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    public Future<List<Integer>> getPhotosId() {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery(
                                "SELECT p.id FROM Photo p",
                                Integer.class
                        )
                        .getResultList();
            } catch (Exception e) {
                logger.error("Could not get photos id from db!", e);
            }
            return Collections.emptyList();
        }, false);
    }

    public Future<byte[]> getPhoto(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createNativeQuery(
                                "SELECT lo_get(p.data) FROM photos p WHERE p.id = :id",
                                byte[].class
                        )
                        .setParameter("id", id)
                        .getSingleResult();
            } catch (Exception e) {
                logger.error("Could not get photo by id from db!", e);
            }
            return new byte[0];
        }, false);
    }

    public Future<Boolean> updateMetadata(Integer id, PhotoMetadata updatedMetadata) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                // Fetch the existing Photo
                Photo photo = session.get(Photo.class, id);
                if (photo == null) {
                    logger.warn("Photo with id {} not found!", id);
                    session.getTransaction().rollback();
                    return false;
                }

                photo.setPhotoMetadata(updatedMetadata);
                session.merge(photo);
                session.getTransaction().commit();
                return true;
            } catch (Exception e) {
                logger.error("Could not update photo metadata!", e);
            }
            return false;
        }, false);
    }

    public Future<Boolean> updatePartial(Photo photo) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                // Update Photo: name and description
                MutationQuery query1 = session.createMutationQuery(
                        "UPDATE Photo p SET p.name = :name, p.description = :description WHERE p.id = :id"
                );
                query1.setParameter("name", photo.getName());
                query1.setParameter("description", photo.getDescription());
                query1.setParameter("id", photo.getId());
                int rowsUpdated1 = query1.executeUpdate();

                // Update GpsMetadata: latitude, longitude, altitude
                // We assume that photo.getPhotoMetadata().getGps() is not null and its id is available.
                MutationQuery query2 = session.createMutationQuery(
                        "UPDATE GpsMetadata g SET g.latitude = :latitude, g.longitude = :longitude, g.altitude = :altitude WHERE g.id = :gpsId"
                );
                query2.setParameter("latitude", photo.getPhotoMetadata().getGps().getLatitude());
                query2.setParameter("longitude", photo.getPhotoMetadata().getGps().getLongitude());
                query2.setParameter("altitude", photo.getPhotoMetadata().getGps().getAltitude());
                query2.setParameter("gpsId", photo.getPhotoMetadata().getGps().getId());
                int rowsUpdated2 = query2.executeUpdate();

                session.getTransaction().commit();

                return (rowsUpdated1 > 0) && (rowsUpdated2 > 0);
            } catch (Exception e) {
                logger.error("Could not update photo partially in db!", e);
            }
            return false;
        }, false);
    }

    public Future<Photo> getLightWeightById(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                TypedQuery<Object[]> query = session.createQuery(
                        "SELECT p.id, p.name, p.description, p.size, p.uploadedAt, p.photoMetadata FROM Photo p WHERE p.id = :id",
                        Object[].class
                );

                query.setParameter("id", id);

                Object[] result = query.getSingleResult();

                session.getTransaction().commit();

                if (result != null) {
                    return Photo.builder()
                            .id((Integer) result[0])
                            .name((String) result[1])
                            .description((String) result[2])
                            .size((String) result[3])
                            .uploadedAt((Instant) result[4])
                            .photoMetadata((PhotoMetadata) result[5])
                            .data(new byte[0])
                            .thumbnail(new byte[0])
                            .build();
                }

            } catch (Exception e) {
                logger.error("Could not getLightWeightById from db! id: {}", id, e);
            }
            return null;
        }, false);
    }

    public Future<Photo> getWithThumbnailById(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                TypedQuery<Object[]> query = session.createQuery(
                        "SELECT p.id, p.name, p.description, p.thumbnail, p.size, p.uploadedAt, p.photoMetadata FROM Photo p WHERE p.id = :id",
                        Object[].class
                );

                query.setParameter("id", id);

                Object[] result = query.getSingleResult();

                session.getTransaction().commit();

                if (result != null) {
                    return Photo.builder()
                            .id((Integer) result[0])
                            .name((String) result[1])
                            .description((String) result[2])
                            .thumbnail((byte[]) result[3])
                            .size((String) result[4])
                            .uploadedAt((Instant) result[5])
                            .photoMetadata((PhotoMetadata) result[6])
                            .data(new byte[0])
                            .build();
                }

            } catch (Exception e) {
                logger.error("Could not getWithThumbnailById from db! id: {}", id, e);
            }
            return null;
        }, false);
    }

    public Future<Photo> getWithPhotoById(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

                TypedQuery<Object[]> query = session.createQuery(
                        "SELECT p.id, p.name, p.description, p.data, p.size, p.uploadedAt, p.photoMetadata FROM Photo p WHERE p.id = :id",
                        Object[].class
                );

                query.setParameter("id", id);

                Object[] result = query.getSingleResult();

                session.getTransaction().commit();

                if (result != null) {
                    return Photo.builder()
                            .id((Integer) result[0])
                            .name((String) result[1])
                            .description((String) result[2])
                            .data((byte[]) result[3])
                            .size((String) result[4])
                            .uploadedAt((Instant) result[5])
                            .photoMetadata((PhotoMetadata) result[6])
                            .thumbnail(new byte[0])
                            .build();
                }

            } catch (Exception e) {
                logger.error("Could not getWithPhotoById from db! id: {}", id, e);
            }
            return null;
        }, false);
    }


    @Override
    protected Class<Photo> getType() {
        return Photo.class;
    }
}

package azar.dal.dao;

import azar.entities.db.PdfFile;
import azar.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.hibernate.query.MutationQuery;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@Singleton
public class PdfFileDao extends GenericDao<PdfFile> {

    @Inject
    public PdfFileDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    protected Class<PdfFile> getType() {
        return PdfFile.class;
    }

    public Future<List<azar.entities.client.PdfFile>> getAllClientPaginated(int offset, int limit) {
        return Future.future(listPromise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    List<azar.entities.client.PdfFile> paginatedResults = session
                            .createQuery(
                                    "SELECT new azar.entities.client.PdfFile(p.id, p.uploadedBy, p.fileName, p.contentType, p.labels, p.size, p.uploadedAt, p.description)" +
                                            " FROM PdfFile p",
                                    azar.entities.client.PdfFile.class)
                            .setFirstResult(offset) // Offset
                            .setMaxResults(limit)   // Limit
                            .getResultList();

                    listPromise.complete(paginatedResults);
                } catch (Exception e) {
                    listPromise.fail(e);
                }
                return null;
            }, false);
        });
    }

    public Future<byte[]> getThumbnailById(Integer id) {
        return Future.future(thumbnailPromise -> {
            try (Session session = openSession()) {
                vertx.executeBlocking(() -> {
                    byte[] thumbnail = session
                            .createNativeQuery(
                                    "SELECT lo_get(p.thumbnail) FROM pdf_files p WHERE p.id = :id",
                                    byte[].class
                            )
                            .setParameter("id", id)
                            .getSingleResult();

                    thumbnailPromise.complete(thumbnail);
                    return null;
                }, false);
            } catch (Exception e) {
                thumbnailPromise.fail(e);
            }
        });
    }

    public Future<String> getOwnerByPdfId(Integer id) {
        return Future.future(pdfOwnerPromise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    String pdfOwner = session
                            .createNativeQuery(
                                    "SELECT p.uploadedBy FROM pdf_files p WHERE p.id = :id",
                                    String.class
                            )
                            .setParameter("id", id)
                            .getSingleResult();

                    pdfOwnerPromise.complete(pdfOwner);
                } catch (Exception e) {
                    pdfOwnerPromise.fail(e);
                }
                return null;
            }, false);
        });
    }

    public Future<Boolean> updatePartial(PdfFile pdfFile) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                try (Session session = openSession()) {
                    session.beginTransaction();

                    // Use createMutationQuery for UPDATE queries
                    MutationQuery query = session.createMutationQuery(
                            "UPDATE PdfFile e " +
                                    "SET e.fileName = :fileName, e.labels = :labels, e.description = :description " +
                                    "WHERE e.id = :id"
                    );
                    query.setParameter("fileName", pdfFile.getFileName());
                    query.setParameter("labels", pdfFile.getLabels());
                    query.setParameter("description", pdfFile.getDescription());
                    query.setParameter("id", pdfFile.getId());

                    int rowsUpdated = query.executeUpdate();
                    session.getTransaction().commit();

                    promise.complete(rowsUpdated > 0); // Return true if rows were updated
                } catch (Exception e) {
                    promise.fail(e);
                }
                return null;
            }, false);
        });
    }


}

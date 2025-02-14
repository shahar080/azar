package azar.cloud.dal.dao;

import azar.cloud.entities.client.PdfFile;
import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.hibernate.query.MutationQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@Singleton
public class PdfFileDao extends GenericDao<azar.cloud.entities.db.PdfFile> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    public PdfFileDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    protected Class<azar.cloud.entities.db.PdfFile> getType() {
        return azar.cloud.entities.db.PdfFile.class;
    }

    public Future<List<PdfFile>> getAllClientPaginated(int offset, int limit) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery(
                                "SELECT new azar.cloud.entities.client.PdfFile(p.id, p.uploadedBy, p.fileName, p.contentType, p.labels, p.size, p.uploadedAt, p.description)" +
                                        " FROM PdfFile p",
                                PdfFile.class)
                        .setFirstResult(offset)
                        .setMaxResults(limit)
                        .getResultList();
            } catch (Exception e) {
                logger.error("Could not get PdfFiles from db!", e);
            }
            return Collections.emptyList();
        }, false);
    }

    public Future<String> getOwnerByPdfId(Integer id) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createNativeQuery(
                                "SELECT p.uploadedBy FROM pdf_files p WHERE p.id = :id",
                                String.class
                        )
                        .setParameter("id", id)
                        .getSingleResult();
            } catch (Exception e) {
                logger.error("Could not get pdf owner from db!", e);
            }
            return "";
        }, false);
    }

    public Future<Boolean> updatePartial(azar.cloud.entities.db.PdfFile pdfFile) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                session.beginTransaction();

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

                return rowsUpdated > 0;
            } catch (Exception e) {
                logger.error("Could not update pdf partially in db!", e);
            }
            return false;
        }, false);
    }

    @Override
    protected boolean hasThumbnail() {
        return true;
    }
}

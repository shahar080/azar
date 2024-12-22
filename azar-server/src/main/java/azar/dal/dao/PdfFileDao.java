package azar.dal.dao;

import azar.entities.db.PdfFile;
import io.vertx.core.Future;
import org.hibernate.Session;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
public class PdfFileDao extends GenericDao<PdfFile> {


    @Override
    protected Class<PdfFile> getType() {
        return PdfFile.class;
    }

    public Future<List<azar.entities.client.PdfFile>> getAllClientPaginated(int offset, int limit) {
        return Future.future(listPromise -> {
            try (Session session = openSession()) {
                List<azar.entities.client.PdfFile> paginatedResults = session
                        .createQuery(
                                "SELECT new azar.entities.client.PdfFile(p.id, p.fileName, p.contentType, p.labels, p.size, p.uploadedAt, p.description)" +
                                        " FROM PdfFile p",
                                azar.entities.client.PdfFile.class)
                        .setFirstResult(offset) // Offset
                        .setMaxResults(limit)   // Limit
                        .getResultList();

                listPromise.complete(paginatedResults);
            } catch (Exception e) {
                listPromise.fail(e);
            }
        });
    }

    public Future<byte[]> getThumbnailById(Integer id) {
        return Future.future(thumbnailPromise -> {
            try (Session session = openSession()) {
                byte[] thumbnail = session
                        .createNativeQuery(
                                "SELECT lo_get(p.thumbnail) FROM pdf_files p WHERE p.id = :id",
                                byte[].class
                        )
                        .setParameter("id", id)
                        .getSingleResult();

                thumbnailPromise.complete(thumbnail);
            } catch (Exception e) {
                thumbnailPromise.fail(e);
            }
        });
    }
}

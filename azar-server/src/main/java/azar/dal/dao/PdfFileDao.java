package azar.dal.dao;

import azar.entities.db.PdfFile;
import io.vertx.core.Future;
import org.hibernate.Session;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 * Purpose: //TODO add purpose for class PdfFileDao
 **/
public class PdfFileDao extends GenericDao<PdfFile> {


    @Override
    protected Class<PdfFile> getType() {
        return PdfFile.class;
    }

    public Future<List<PdfFile>> getAllPaginated(int offset, int limit) {
        return Future.future(listPromise -> {
            try (Session session = openSession()) {
                List<PdfFile> paginatedResults = session
                        .createQuery("SELECT p FROM PdfFile p", PdfFile.class)
                        .setFirstResult(offset) // Offset
                        .setMaxResults(limit)   // Limit
                        .getResultList();

                listPromise.complete(paginatedResults);
            } catch (Exception e) {
                listPromise.fail(e);
            }
        });
    }
}

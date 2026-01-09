package azar.shared.dal.dao;

import java.util.List;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: Generic Dao definition
 **/
public abstract class GenericDao<T> implements PanacheRepository<T> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    public T findById(Integer id) {
        return findById(Long.valueOf(id));
    }

    public boolean deleteById(Integer id) {
        return deleteById(Long.valueOf(id));
    }

    public List<T> getAllPaginated(int offset, int limit) {
        PanacheQuery<T> q = findAll();
        q.page(Page.of(offset, limit));
        return q.list();
    }

    public byte[] getThumbnailById(String entityName, Integer id) {
        if (!hasThumbnail()) {
            logger.warn("getThumbnailById was called by unsupported type!");
            return new byte[0];
        }
        String sql = "SELECT p.thumbnail AS data FROM %s p WHERE p.id = :id".formatted(entityName);
        Object r = getEntityManager()
                .createNativeQuery(sql)
                .setParameter("id", id)
                .getSingleResult();
        if (r instanceof byte[] b) {
            return b;
        }
        logger.warn("{} with id ({}) has corrupt thumbnail", entityName, id);
        return new byte[0];
    }

    protected boolean hasThumbnail() {
        return false;
    }

}

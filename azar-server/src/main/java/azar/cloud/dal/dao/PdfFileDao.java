package azar.cloud.dal.dao;

import java.util.List;
import azar.cloud.entities.db.PdfFile;
import azar.shared.dal.dao.GenericDao;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@ApplicationScoped
public class PdfFileDao extends GenericDao<azar.cloud.entities.db.PdfFile> {

    public List<PdfFile> getAllClientPaginated(int page, int size) {
        int pageIndex = Math.max(0, page - 1);      // 1-based -> 0-based
        int pageSize = Math.max(1, size);

        PanacheQuery<PdfFile> q = findAll(Sort.by("id")); // stable order matters for paging
        q.page(Page.of(pageIndex, pageSize));
        return q.list();
    }

    public String getOwnerByPdfId(Integer pdfId) {
        return findById(pdfId).getUploadedBy();
    }

    @Override
    protected boolean hasThumbnail() {
        return true;
    }
}

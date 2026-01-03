package azar.cloud.dal.service;

import java.util.List;
import azar.cloud.dal.dao.PdfFileDao;
import azar.cloud.entities.db.PdfFile;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@ApplicationScoped
public class PdfFileService extends GenericService<azar.cloud.entities.db.PdfFile> {

    private final PdfFileDao pdfFileDao;

    public PdfFileService(PdfFileDao pdfFileDao) {
        this.pdfFileDao = pdfFileDao;
    }

    @Override
    protected GenericDao<PdfFile> getDao() {
        return pdfFileDao;
    }

    public byte[] getThumbnailById(Integer id) {
        return pdfFileDao.getThumbnailById("pdf_files", id);
    }

    public List<PdfFile> getAllClientPaginated(int page, int size) {
        return pdfFileDao.getAllClientPaginated(page, size);
    }

    public String getOwnerByPdfId(Integer pdfId) {
        return pdfFileDao.getOwnerByPdfId(pdfId);
    }

    public boolean updatePartial(PdfFile pdfFile) {
        PdfFile dbPdfFile = pdfFileDao.findById(pdfFile.getId());
        dbPdfFile.setFileName(pdfFile.getFileName());
        dbPdfFile.setLabels(pdfFile.getLabels());
        dbPdfFile.setDescription(pdfFile.getDescription());

        return merge(dbPdfFile) != null;
    }

}

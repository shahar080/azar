package azar.cloud.dal.service;

import azar.cloud.entities.client.PdfFile;
import azar.cloud.dal.dao.PdfFileDao;
import azar.shared.dal.service.GenericService;
import com.google.inject.Inject;
import io.vertx.core.Future;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
public class PdfFileService extends GenericService<azar.cloud.entities.db.PdfFile> {

    private final PdfFileDao pdfFileDao;

    @Inject
    public PdfFileService(PdfFileDao pdfFileDao) {
        this.pdfFileDao = pdfFileDao;
    }

    @Override
    public Future<Set<azar.cloud.entities.db.PdfFile>> getAll() {
        return pdfFileDao.getAll();
    }

    @Override
    public Future<azar.cloud.entities.db.PdfFile> add(azar.cloud.entities.db.PdfFile pdfFile) {
        return pdfFileDao.add(pdfFile);
    }

    @Override
    public Future<azar.cloud.entities.db.PdfFile> update(azar.cloud.entities.db.PdfFile newItem) {
        return pdfFileDao.update(newItem);
    }

    @Override
    public Future<azar.cloud.entities.db.PdfFile> getById(Integer id) {
        return pdfFileDao.getById(id);
    }

    public Future<byte[]> getThumbnailById(Integer id) {
        return pdfFileDao.getThumbnailById(id);
    }

    @Override
    public Future<Boolean> remove(azar.cloud.entities.db.PdfFile pdfFile) {
        return pdfFileDao.remove(pdfFile);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return pdfFileDao.removeById(id);
    }

    public Future<List<PdfFile>> getAllClientPaginated(int offset, int limit) {
        return pdfFileDao.getAllClientPaginated(offset, limit);
    }

    public Future<String> getOwnerByPdfId(Integer id) {
        return pdfFileDao.getOwnerByPdfId(id);
    }

    public Future<Boolean> updatePartial(azar.cloud.entities.db.PdfFile pdfFile) {
        return pdfFileDao.updatePartial(pdfFile);
    }

}

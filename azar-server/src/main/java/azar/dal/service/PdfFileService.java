package azar.dal.service;

import azar.dal.dao.PdfFileDao;
import azar.entities.db.PdfFile;
import com.google.inject.Inject;
import io.vertx.core.Future;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
public class PdfFileService extends GenericService<PdfFile> {

    @Inject
    private PdfFileDao pdfFileDao;

    @Override
    public Future<Set<PdfFile>> getAll() {
        return pdfFileDao.getAll();
    }

    @Override
    public Future<PdfFile> add(PdfFile pdfFile) {
        return pdfFileDao.add(pdfFile);
    }

    @Override
    public Future<PdfFile> update(PdfFile newItem) {
        return pdfFileDao.update(newItem);
    }

    @Override
    public Future<PdfFile> getById(Integer id) {
        return pdfFileDao.getById(id);
    }

    public Future<byte[]> getThumbnailById(Integer id) {
        return pdfFileDao.getThumbnailById(id);
    }

    @Override
    public Future<Boolean> remove(PdfFile pdfFile) {
        return pdfFileDao.remove(pdfFile);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return pdfFileDao.removeById(id);
    }

    public Future<List<azar.entities.client.PdfFile>> getAllClientPaginated(int offset, int limit) {
        return pdfFileDao.getAllClientPaginated(offset, limit);
    }

    public Future<String> getOwnerByPdfId(Integer id) {
        return pdfFileDao.getOwnerByPdfId(id);
    }

    public Future<Boolean> updatePartial(PdfFile pdfFile) {
        return pdfFileDao.updatePartial(pdfFile);
    }

}

package azar.whoami.dal.service;

import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.CVDao;
import azar.whoami.entities.db.CV;
import com.google.inject.Inject;
import io.vertx.core.Future;

import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVService extends GenericService<CV> {

    private final CVDao cvDao;

    @Inject
    public CVService(CVDao cvDao) {
        this.cvDao = cvDao;
    }

    @Override
    public Future<Set<CV>> getAll() {
        return cvDao.getAll();
    }

    @Override
    public Future<CV> add(CV whoAmIData) {
        return cvDao.add(whoAmIData);
    }

    @Override
    public Future<CV> update(CV whoAmIData) {
        return cvDao.update(whoAmIData);
    }

    @Override
    public Future<CV> getById(Integer id) {
        return cvDao.getById(id);
    }

    @Override
    public Future<Boolean> remove(CV whoAmIData) {
        return cvDao.remove(whoAmIData);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return cvDao.removeById(id);
    }
}

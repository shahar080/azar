package azar.whoami.dal.service;

import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.WhoAmIDao;
import azar.whoami.entities.db.WhoAmIData;
import com.google.inject.Inject;
import io.vertx.core.Future;

import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class WhoAmIService extends GenericService<WhoAmIData> {

    private final WhoAmIDao whoAmIDao;

    @Inject
    public WhoAmIService(WhoAmIDao whoAmIDao) {
        this.whoAmIDao = whoAmIDao;
    }

    @Override
    public Future<Set<WhoAmIData>> getAll() {
        return whoAmIDao.getAll();
    }

    @Override
    public Future<WhoAmIData> add(WhoAmIData whoAmIData) {
        return whoAmIDao.add(whoAmIData);
    }

    @Override
    public Future<WhoAmIData> update(WhoAmIData whoAmIData) {
        return whoAmIDao.update(whoAmIData);
    }

    @Override
    public Future<WhoAmIData> getById(Integer id) {
        return whoAmIDao.getById(id);
    }

    @Override
    public Future<Boolean> remove(WhoAmIData whoAmIData) {
        return whoAmIDao.remove(whoAmIData);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return whoAmIDao.removeById(id);
    }
}

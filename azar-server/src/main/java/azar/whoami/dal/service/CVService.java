package azar.whoami.dal.service;

import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.CVDao;
import azar.whoami.entities.db.CV;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;

import java.util.Optional;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVService extends GenericService<CV> {

    private final CVDao cvDao;
    private final Vertx vertx;

    @Inject
    public CVService(CVDao cvDao, Vertx vertx) {
        this.cvDao = cvDao;
        this.vertx = vertx;
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
    public Future<Boolean> removeById(Integer id) {
        return cvDao.removeById(id);
    }

    public Future<Optional<CV>> getCVFromDB() {
        return Future.future(cvPromise ->
                vertx.executeBlocking(() -> {
                    getAll()
                            .onSuccess(resList -> cvPromise.complete(resList.stream().findFirst()))
                            .onFailure(_ -> cvPromise.complete(Optional.empty()));
                    return null;
                }, false));
    }
}

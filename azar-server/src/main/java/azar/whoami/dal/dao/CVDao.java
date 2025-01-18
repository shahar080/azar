package azar.whoami.dal.dao;

import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import azar.whoami.entities.db.CV;
import com.google.inject.Inject;
import io.vertx.core.Vertx;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVDao extends GenericDao<CV> {

    @Inject
    public CVDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    protected Class<CV> getType() {
        return CV.class;
    }
}

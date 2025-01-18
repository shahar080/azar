package azar.whoami.dal.dao;

import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import azar.whoami.entities.db.WhoAmIData;
import com.google.inject.Inject;
import io.vertx.core.Vertx;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class WhoAmIDao extends GenericDao<WhoAmIData> {

    @Inject
    public WhoAmIDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    protected Class<WhoAmIData> getType() {
        return WhoAmIData.class;
    }
}

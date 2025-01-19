package azar.whoami.dal.dao;

import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import azar.whoami.entities.db.EmailData;
import com.google.inject.Inject;
import io.vertx.core.Vertx;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
public class EmailDao extends GenericDao<EmailData> {

    @Inject
    public EmailDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    @Override
    protected Class<EmailData> getType() {
        return EmailData.class;
    }
}

package azar.whoami.dal.service;

import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.EmailDao;
import azar.whoami.entities.db.EmailData;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;

import java.util.Optional;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
public class EmailService extends GenericService<EmailData> {

    private final EmailDao emailDao;
    private final Vertx vertx;

    @Inject
    public EmailService(EmailDao emailDao, Vertx vertx) {
        this.emailDao = emailDao;
        this.vertx = vertx;
    }

    @Override
    public Future<Set<EmailData>> getAll() {
        return emailDao.getAll();
    }

    @Override
    public Future<EmailData> add(EmailData emailData) {
        return emailDao.add(emailData);
    }

    @Override
    public Future<EmailData> update(EmailData emailData) {
        return emailDao.update(emailData);
    }

    @Override
    public Future<EmailData> getById(Integer id) {
        return emailDao.getById(id);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return emailDao.removeById(id);
    }

    public Future<Optional<EmailData>> getEmailFromDB() {
        return Future.future(emailPromise ->
                vertx.executeBlocking(() -> {
                    getAll()
                            .onSuccess(resList -> emailPromise.complete(resList.stream().findFirst()))
                            .onFailure(_ -> emailPromise.complete(Optional.empty()));
                    return null;
                }, false));
    }
}

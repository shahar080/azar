package azar.whoami.dal.service;

import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.EmailDao;
import azar.whoami.entities.db.EmailData;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
@ApplicationScoped
public class EmailService extends GenericService<EmailData> {

    private final EmailDao emailDao;

    public EmailService(EmailDao emailDao) {
        this.emailDao = emailDao;
    }

    @Override
    protected GenericDao<EmailData> getDao() {
        return emailDao;
    }

    public EmailData getDefaultData() {
        EmailData emailData = new EmailData();
        emailData.setTitle("Shahar Azar CV");
        emailData.setBody("""
                Hey,
                
                I've added my CV.
                
                Thanks!""");
        return emailData;
    }
}

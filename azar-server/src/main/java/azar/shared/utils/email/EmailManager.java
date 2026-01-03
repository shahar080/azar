package azar.shared.utils.email;

import azar.whoami.dal.service.CVService;
import azar.whoami.dal.service.EmailService;
import azar.whoami.entities.db.CV;
import azar.whoami.entities.db.EmailData;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@ApplicationScoped
public class EmailManager {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final CVService cvService;
    private final EmailService emailService;
    private final Mailer mailer;

    public EmailManager(CVService cvService, EmailService emailService, Mailer mailer) {
        this.cvService = cvService;
        this.emailService = emailService;
        this.mailer = mailer;
    }

    public boolean sendEmail(String recipientEmail) {
        try {
            EmailData emailData = emailService.getFirst();
            if (emailData == null) {
                emailData = emailService.getDefaultData();
                logger.warn("Using default email data");
            }

            CV cv = cvService.getFirst();
            if (cv == null) {
                cv = cvService.getDefault();
                logger.warn("Using default cv");
            }

            Mail mail = Mail.withText(recipientEmail, emailData.getTitle(), emailData.getBody());
            mail.addAttachment(cv.getFileName(), cv.getData(), "application/pdf");
            mailer.send(mail);
            logger.info("Successfully sent email to {}", recipientEmail);
            return true;

        } catch (Exception e) {
            logger.error("Failed to send email to {}", recipientEmail, e);
            return false;
        }
    }
}
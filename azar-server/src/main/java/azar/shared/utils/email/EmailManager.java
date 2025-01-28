package azar.shared.utils.email;

import azar.shared.properties.AppProperties;
import azar.whoami.dal.service.CVService;
import azar.whoami.dal.service.EmailService;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import jakarta.activation.DataHandler;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class EmailManager {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;
    private final CVService cvService;
    private final EmailService emailService;

    @Inject
    public EmailManager(AppProperties appProperties, CVService cvService, EmailService emailService) {
        this.appProperties = appProperties;
        this.cvService = cvService;
        this.emailService = emailService;
    }

    public Future<Boolean> sendEmail(String recipientEmail, Vertx vertx) {
        return Future.future(promise ->
                vertx.executeBlocking(() -> {
                    emailService.getEmailFromDB()
                            .onSuccess(optionalEmailData -> {
                                if (optionalEmailData.isEmpty()) {
                                    promise.succeed(false);
                                    return;
                                }

                                final String senderEmail = appProperties.getProperty("email.sender.email");
                                final String senderPassword = appProperties.getProperty("email.sender.password");

                                // Configure SMTP properties
                                Properties props = new Properties();
                                props.put("mail.smtp.host", "smtp.gmail.com");
                                props.put("mail.smtp.port", "587");
                                props.put("mail.smtp.auth", "true");
                                props.put("mail.smtp.starttls.enable", "true");

                                // Create a session with authentication
                                Session session = Session.getInstance(props, new Authenticator() {
                                    @Override
                                    protected PasswordAuthentication getPasswordAuthentication() {
                                        return new PasswordAuthentication(senderEmail, senderPassword);
                                    }
                                });

                                try {
                                    // Create a new email message
                                    Message message = new MimeMessage(session);
                                    message.setFrom(new InternetAddress(senderEmail));
                                    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
                                    message.setSubject(optionalEmailData.get().getTitle());

                                    // Create the email body part
                                    MimeBodyPart textPart = new MimeBodyPart();
                                    textPart.setText(optionalEmailData.get().getBody());

                                    // Create the file attachment part
                                    MimeBodyPart attachmentPart = new MimeBodyPart();
                                    cvService.getCVFromDB()
                                            .onSuccess(optionalCV -> {
                                                if (optionalCV.isEmpty()) {
                                                    logger.error("Can't send email due to empty CV");
                                                    promise.complete(false);
                                                    return;
                                                }
                                                try {
                                                    ByteArrayDataSource dataSource = new ByteArrayDataSource(optionalCV.get().getData(), "application/pdf");
                                                    attachmentPart.setDataHandler(new DataHandler(dataSource));
                                                    attachmentPart.setFileName(optionalCV.get().getFileName());

                                                    // Combine the parts into a multipart message
                                                    Multipart multipart = new MimeMultipart();
                                                    multipart.addBodyPart(textPart); // Add the text body
                                                    multipart.addBodyPart(attachmentPart); // Add the file attachment

                                                    // Set the content of the message
                                                    message.setContent(multipart);

                                                    // Send the email
                                                    Transport.send(message);

                                                    logger.info("Successfully sent email to {}", recipientEmail);
                                                    promise.complete(true);
                                                } catch (Exception e) {
                                                    logger.error("Can't send email due to ", e);
                                                    promise.fail(e);
                                                }
                                            })
                                            .onFailure(promise::fail);
                                } catch (MessagingException e) {
                                    logger.error("Failed to send email to {}", (recipientEmail), e);
                                }
                            })
                            .onFailure(promise::fail);
                    return null;
                }, false));
    }
}

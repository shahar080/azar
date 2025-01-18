package azar.shared.utils.email;

import azar.shared.properties.AppProperties;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Properties;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class EmailManager {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;

    @Inject
    public EmailManager(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public Future<Boolean> sendEmail(String recipientEmail, Vertx vertx) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                final String senderEmail = appProperties.getProperty("email.sender.email");
                final String senderPassword = appProperties.getProperty("email.sender.password");

                String subject = "Shahar Azar CV";
                String body = """
                        Hey,
                        
                        I've added my CV.
                        
                        Thanks!""";

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
                    message.setSubject(subject);

                    // Create the email body part
                    MimeBodyPart textPart = new MimeBodyPart();
                    textPart.setText(body);

                    // Create the file attachment part
                    MimeBodyPart attachmentPart = new MimeBodyPart();
                    URL cvResource = getClass().getClassLoader().getResource("Shahar_Azar.pdf"); // TODO: 18/01/2025 AZAR-80
                    if (cvResource == null) {
                        promise.complete(false);
                        return null;
                    }
                    String filePath = cvResource.getPath(); // Replace with your file path
                    File file = new File(filePath);

                    // Attach the file to the email
                    attachmentPart.attachFile(file);

                    // Combine the parts into a multipart message
                    Multipart multipart = new MimeMultipart();
                    multipart.addBodyPart(textPart); // Add the text body
                    multipart.addBodyPart(attachmentPart); // Add the file attachment

                    // Set the content of the message
                    message.setContent(multipart);

                    // Send the email
                    Transport.send(message);
                    logger.info("Successfully sent email to %s".formatted(recipientEmail));

                    promise.complete(true);
                } catch (MessagingException | IOException e) {
                    logger.error("Failed to send email to %s".formatted(recipientEmail), e);
                }
                promise.complete(false);
                return null;
            }, false);
        });
    }
}

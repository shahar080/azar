package azar.whoami.resources;

import java.util.Optional;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import azar.shared.resources.BaseResource;
import azar.whoami.dal.service.EmailService;
import azar.whoami.entities.db.EmailData;
import azar.whoami.entities.requests.UpdateEmailDataRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
@Path("/api/wai/email")
public class EmailResource extends BaseResource {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final EmailService emailService;

    public EmailResource(EmailService emailService) {
        this.emailService = emailService;
    }

    @Path(ADMIN_PREFIX_STRING + "/get")
    @GET
    @Transactional
    @PermitAll
    public Response getEmail() {
        EmailData emailData = emailService.getFirst();
        if (emailData == null) {
            logger.warn("Could not get email data from db, returning default value..");
            return ok(emailService.getDefaultData());
        }
        return ok(emailData);
    }

    @Path(ADMIN_PREFIX_STRING + "/update")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response updateEmail(UpdateEmailDataRequest updateEmailDataRequest) {
        Optional<EmailData> optionalEmailData = Optional.ofNullable(emailService.getFirst());
        EmailData emailData = optionalEmailData.orElse(new EmailData());
        EmailData clientEmailData = updateEmailDataRequest.getEmailData();
        emailData.setTitle(clientEmailData.getTitle());
        emailData.setBody(clientEmailData.getBody());
        if (emailService.merge(emailData) != null) {
            return ok("Successfully updated email data");
        }
        return internalError("Error while updating email data");
    }
}

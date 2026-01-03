package azar.whoami.resources;

import java.nio.file.Files;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import static azar.cloud.utils.Constants.DEFAULT_CV_FILE_PATH;
import azar.shared.dal.service.UserService;
import azar.shared.resources.BaseResource;
import azar.shared.utils.Utilities;
import azar.shared.utils.email.EmailManager;
import azar.whoami.dal.service.CVService;
import azar.whoami.entities.db.CV;
import azar.whoami.entities.requests.EmailCVRequest;
import io.smallrye.common.annotation.Blocking;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Path("/api/wai/cv")
public class CVResource extends BaseResource {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final EmailManager emailManager;
    private final CVService cvService;
    private final UserService userService;

    public CVResource(EmailManager emailManager, CVService cvService, UserService userService) {
        this.emailManager = emailManager;
        this.cvService = cvService;
        this.userService = userService;
    }

    @Path("/get")
    @GET
    @Transactional
    @PermitAll
    public Response getCV() {
        CV optionalCV = cvService.getFirst();
        if (optionalCV == null) {
            logger.warn("Could not get cv from db, returning default value..");
            return okPdf("Return default CV to client..", DEFAULT_CV_FILE_PATH, getFileContent(DEFAULT_CV_FILE_PATH));
        }
        return okPdf("Return CV to client..", optionalCV.getFileName(), optionalCV.getData());
    }

    @Path("/sendToEmail")
    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @Transactional
    @PermitAll
    public Response sendToEmail(EmailCVRequest request) {
        String email = request.getEmail();

        if (!Utilities.isValidEmail(email)) {
            return badRequest("Email %s is invalid".formatted(email));
        }

        if (emailManager.sendEmail(request.getEmail())) {
            return ok(null);
        }
        return internalError("Error while trying to send CV to email %s".formatted(email));
    }

    @Path(ADMIN_PREFIX_STRING + "/update")
    @POST
    @Blocking
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response updateCV(@FormParam("userName") String userName, @org.jboss.resteasy.reactive.RestForm("file")
    org.jboss.resteasy.reactive.multipart.FileUpload file) {
        if (file == null) {
            return badRequest("No file uploaded");
        }

        if (!userService.isAdmin(userName)) {
            return unauthorized("User %s is not authorized to add users!".formatted(userName));
        }
        byte[] bytes;
        try {
            bytes = Files.readAllBytes(file.filePath());
        } catch (Exception e) {
            return internalError("Failed to read uploaded file: %s".formatted(e.getMessage()));
        }
        CV cv = cvService.getFirst();
        if (cv == null) {
            cv = new CV();
        }
        cv.setFileName(file.fileName());
        cv.setData(bytes);
        cvService.merge(cv);

        return ok(cv);
    }

}

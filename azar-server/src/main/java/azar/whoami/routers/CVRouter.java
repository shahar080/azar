package azar.whoami.routers;

import azar.shared.dal.service.UserService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.shared.utils.Utilities;
import azar.shared.utils.email.EmailManager;
import azar.whoami.dal.service.CVService;
import azar.whoami.entities.db.CV;
import azar.whoami.entities.requests.EmailCVRequest;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static azar.cloud.utils.Constants.*;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final JsonManager jsonManager;
    private final EmailManager emailManager;
    private final Vertx vertx;
    private final CVService cvService;
    private final UserService userService;

    @Inject
    public CVRouter(JsonManager jsonManager, EmailManager emailManager, Vertx vertx,
                    CVService cvService, UserService userService) {
        this.jsonManager = jsonManager;
        this.emailManager = emailManager;
        this.vertx = vertx;
        this.cvService = cvService;
        this.userService = userService;
    }

    public Router create(Vertx vertx) {
        Router cvRouter = Router.router(vertx);

        cvRouter.get("/get").handler(this::handleGet);
        cvRouter.post("/sendToEmail").handler(this::handleSendToEmail);
        cvRouter.post(OPS_PREFIX_STRING + "/update").handler(this::handleUpdate);

        return cvRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        cvService.getCVFromDB()
                .onSuccess(optionalCV -> {
                    if (optionalCV.isEmpty()) {
                        logger.warn("Could not get cv from db, returning default value..");
                        sendOKPDFResponse(routingContext, "Sending DEFAULT CV back to client", DEFAULT_CV_FILE_NAME, getFileContent(DEFAULT_CV_FILE_PATH));
                        return;
                    }
                    sendOKPDFResponse(routingContext, "Sending CV back to client", optionalCV.get().getFileName(), optionalCV.get().getData());
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting cv data, error: %s".formatted(err.getMessage())));
    }

    private void handleSendToEmail(RoutingContext routingContext) {
        EmailCVRequest request = jsonManager.fromJson(routingContext.body().asString(), EmailCVRequest.class);
        String email = request.getEmail();

        if (!Utilities.isValidEmail(email)) {
            sendInternalErrorResponse(routingContext, "Email %s is invalid".formatted(email));
            return;
        }

        emailManager.sendEmail(request.getEmail(), vertx)
                .onSuccess(result -> {
                    if (result) {
                        sendOKResponse(routingContext, "Successfully sent CV to email %s".formatted(email));
                    } else {
                        sendInternalErrorResponse(routingContext, "Error while trying to send CV to email %s".formatted(email));
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error while trying to send CV to email %s".formatted(email)));
    }

    private void handleUpdate(RoutingContext routingContext) {
        String userName = routingContext.request().getFormAttribute("userName");
        if (isInvalidUsername(routingContext, userName)) return;

        List<FileUpload> fileUploads = routingContext.fileUploads();
        if (fileUploads.isEmpty()) {
            sendBadRequestResponse(routingContext, "No file uploaded");
            return;
        }

        FileUpload fileUpload = fileUploads.getFirst();
        String uploadedFilePath = fileUpload.uploadedFileName();

        userService.isAdmin(userName)
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(userName));
                        return;
                    }

                    routingContext.vertx().fileSystem().readFile(uploadedFilePath)
                            .onSuccess(buffer ->
                                    cvService.getCVFromDB().
                                            onSuccess(optionalCV -> {
                                                CV cv = optionalCV.orElse(new CV());
                                                cv.setFileName(fileUpload.fileName());
                                                cv.setData(buffer.getBytes());

                                                try {
                                                    cvService.update(cv)
                                                            .onSuccess(savedCV -> {
                                                                savedCV.setData(new byte[0]);
                                                                sendCreatedResponse(routingContext, jsonManager.toJson(savedCV),
                                                                        "CV %s uploaded successfully by %s".formatted(savedCV.getFileName(), userName));
                                                            })
                                                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error saving %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())));
                                                } catch (Exception err) {
                                                    sendInternalErrorResponse(routingContext, "Unexpected error while uploading cv %s".formatted(fileUpload.fileName()));
                                                }

                                            })
                                            .onFailure(_ -> sendInternalErrorResponse(routingContext, "Unexpected error while uploading cv %s".formatted(fileUpload.fileName()))))
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to read upload cv %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to read upload cv %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())))
                .eventually(() -> routingContext.vertx().fileSystem().delete(uploadedFilePath)
                        .onSuccess(_ -> logger.info("Temporary file deleted: {}", uploadedFilePath))
                        .onFailure(err -> logger.warn("Failed to delete temporary file: {}", uploadedFilePath, err)));
    }

}

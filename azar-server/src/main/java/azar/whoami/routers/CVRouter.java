package azar.whoami.routers;

import azar.shared.dal.service.UserService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.shared.utils.Utilities;
import azar.shared.utils.email.EmailManager;
import azar.whoami.dal.service.CVService;
import azar.whoami.entities.db.CV;
import azar.whoami.entities.requests.EmailCVRequest;
import azar.whoami.entities.requests.UpdateCVRequest;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import java.util.Optional;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVRouter extends BaseRouter {

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

        cvRouter.route("/get").handler(this::handleGet);
        cvRouter.route("/sendToEmail").handler(this::handleSendToEmail);
        cvRouter.route("/update").handler(this::handleUpdate);

        return cvRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        cvService.getAll()
                .onSuccess(resList -> {
                    Optional<CV> cv = resList.stream().findFirst();
                    if (cv.isEmpty()) {
                        sendInternalErrorResponse(routingContext, "Could not get CV from db!");
                        return;
                    }
                    routingContext.response()
                            .putHeader("Content-Type", "application/pdf")
                            .putHeader("Content-Disposition", "inline; filename=" + cv.get().getFileName())
                            .end(Buffer.buffer(cv.get().getData()));
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
        UpdateCVRequest updateCVRequest = jsonManager.fromJson(routingContext.body().asString(), UpdateCVRequest.class);
        String currentUser = updateCVRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        userService.getUserByUserName(updateCVRequest.getCurrentUser())
                .onSuccess(dbUser -> {
                    if (dbUser == null) {
                        sendBadRequestResponse(routingContext, "Can't find user with the username %s".formatted(updateCVRequest.getCurrentUser()));
                        return;
                    }
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(updateCVRequest.getCurrentUser()));
                        return;
                    }
                    CV cv = updateCVRequest.getCv();

                    cvService.update(cv)
                            .onSuccess(updatedCV -> sendOKResponse(routingContext, jsonManager.toJson(updatedCV), "User %s updated cv".formatted(currentUser)))
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating cv, error: %s".formatted(err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating cv, error: %s".formatted(err.getMessage())));
    }
}

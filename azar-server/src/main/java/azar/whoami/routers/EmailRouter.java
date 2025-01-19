package azar.whoami.routers;

import azar.shared.dal.service.UserService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.whoami.dal.service.EmailService;
import azar.whoami.entities.db.EmailData;
import azar.whoami.entities.requests.UpdateEmailDataRequest;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
public class EmailRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final JsonManager jsonManager;
    private final EmailService emailService;
    private final UserService userService;

    @Inject
    public EmailRouter(JsonManager jsonManager, EmailService emailService, UserService userService) {
        this.jsonManager = jsonManager;
        this.emailService = emailService;
        this.userService = userService;
    }

    public Router create(Vertx vertx) {
        Router cvRouter = Router.router(vertx);

        cvRouter.route("/ops/get").handler(this::handleGet);
        cvRouter.route("/ops/update").handler(this::handleUpdate);

        return cvRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        emailService.getEmailFromDB()
                .onSuccess(optionalEmailData -> {
                    if (optionalEmailData.isEmpty()) {
                        logger.warn("Could not get email data from db, returning default value..");
                        sendOKResponse(routingContext, jsonManager.toJson(getDefaultData()), "Sent DEFAULT email data back to client");
                        return;
                    }
                    sendOKResponse(routingContext, jsonManager.toJson(optionalEmailData.get()), "Sent email data back to client");
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting email data, error: %s".formatted(err.getMessage())));
    }

    private void handleUpdate(RoutingContext routingContext) {
        UpdateEmailDataRequest updateEmailDataRequest = jsonManager.fromJson(routingContext.body().asString(), UpdateEmailDataRequest.class);
        String currentUser = updateEmailDataRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        userService.getUserByUserName(updateEmailDataRequest.getCurrentUser())
                .onSuccess(dbUser -> {
                    if (dbUser == null) {
                        sendBadRequestResponse(routingContext, "Can't find user with the username %s".formatted(updateEmailDataRequest.getCurrentUser()));
                        return;
                    }
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(updateEmailDataRequest.getCurrentUser()));
                        return;
                    }
                    emailService.getEmailFromDB()
                            .onSuccess(optionalEmailData -> {
                                EmailData emailData = optionalEmailData.orElse(new EmailData());
                                EmailData clientEmailData = updateEmailDataRequest.getEmailData();
                                emailData.setTitle(clientEmailData.getTitle());
                                emailData.setBody(clientEmailData.getBody());

                                emailService.update(emailData)
                                        .onSuccess(_ -> sendOKResponse(routingContext, "Successfully updated email data", "User %s updated email data".formatted(currentUser)))
                                        .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating email data, error: %s".formatted(err.getMessage())));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating email data, error: %s".formatted(err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating email data, error: %s".formatted(err.getMessage())));
    }

    private EmailData getDefaultData() {
        EmailData emailData = new EmailData();
        emailData.setTitle("Shahar Azar CV");
        emailData.setBody("""
                Hey,
                
                I've added my CV.
                
                Thanks!""");
        return emailData;
    }
}

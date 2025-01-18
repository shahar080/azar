package azar.whoami.routers;

import azar.cloud.routers.BaseRouter;
import azar.cloud.utils.JsonManager;
import azar.cloud.utils.email.EmailManager;
import azar.shared.utils.Utilities;
import azar.whoami.entities.requests.EmailCVRequest;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import java.net.URL;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class CVRouter extends BaseRouter {

    private final JsonManager jsonManager;
    private final EmailManager emailManager;
    private final Vertx vertx;

    @Inject
    public CVRouter(JsonManager jsonManager, EmailManager emailManager, Vertx vertx) {
        this.jsonManager = jsonManager;
        this.emailManager = emailManager;
        this.vertx = vertx;
    }

    public Router create(Vertx vertx) {
        Router cvRouter = Router.router(vertx);

        cvRouter.route("/get").handler(this::handleGet);
        cvRouter.route("/sendToEmail").handler(this::handleSendToEmail);

        return cvRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        URL cvResource = getClass().getClassLoader().getResource("Shahar_Azar.pdf");
        if (cvResource == null) {
            sendInternalErrorResponse(routingContext, "Failed to send CV back to client");
            return;
        }

        routingContext.vertx().fileSystem().readFile(cvResource.getPath())
                .onSuccess(buffer -> {
                    routingContext.response()
                            .putHeader("Content-Type", "application/pdf")
                            .putHeader("Content-Disposition", "inline; filename=Shahar_Azar.pdf")
                            .end(Buffer.buffer(buffer.getBytes()));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to send CV back to client"));
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
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while trying to send CV to email %s".formatted(email)));
    }
}

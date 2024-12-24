package azar.verticals.routers;

import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public abstract class BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    // 20X
    protected void sendOKResponse(RoutingContext routingContext, String response, String logMessage) {
        sendResponse(routingContext, 200, response, logMessage, true);
    }

    protected void sendCreatedResponse(RoutingContext routingContext, String response, String logMessage) {
        sendResponse(routingContext, 201, response, logMessage, true);
    }

    // 40X
    protected void sendBadRequestResponse(RoutingContext routingContext, String logMessage) {
        sendResponse(routingContext, 400, "Bad request", logMessage, false);
    }

    protected void sendUnauthorizedErrorResponse(RoutingContext routingContext, String logMessage) {
        sendResponse(routingContext, 401, "Unauthorized", logMessage, false);
    }

    protected void sendNotFoundResponse(RoutingContext routingContext, String logMessage) {
        sendResponse(routingContext, 404, "Not found", logMessage, false);
    }

    // 50X
    protected void sendInternalErrorResponse(RoutingContext routingContext, String logMessage) {
        sendResponse(routingContext, 500, "Internal server error", logMessage, false);
    }


    private void sendResponse(RoutingContext routingContext, int statusCode, String message, String logMessage,
                              boolean isOk) {
        routingContext.response()
                .setStatusCode(statusCode)
                .putHeader("Content-Type", "application/json")
                .end(message);
        if (isOk) {
            logger.info(String.format("%s - %s", routingContext.currentRoute().getPath(), logMessage));
        } else {
            logger.warn(String.format("%s - %s", routingContext.currentRoute().getPath(), logMessage));
        }
    }

    protected boolean isInvalidUsername(RoutingContext routingContext, String userName) {
        if (userName == null || userName.trim().isEmpty()) {
            sendBadRequestResponse(routingContext, "Username is mandatory to perform operations");
            return true;
        }
        logger.info("{} made a request for path: {}", userName, routingContext.currentRoute().getPath());
        return false;
    }

}

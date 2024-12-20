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

    protected void sendErrorResponse(RoutingContext routingContext, String logMessage, Object... logParams) {
        sendErrorResponse(routingContext, 500, "Internal server error!", logMessage, logParams);
    }

    protected void sendErrorResponse(RoutingContext routingContext, int statusCode, String message, String
            logMessage, Object... logParams) {
        routingContext.response()
                .setStatusCode(statusCode)
                .putHeader("Content-Type", "application/json")
                .end(message);
        logger.warn(String.format("%s - %s", routingContext.currentRoute().getPath(), logMessage), logParams);
    }
}

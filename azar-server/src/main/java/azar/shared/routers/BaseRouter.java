package azar.shared.routers;

import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public abstract class BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    // 20X
    protected void sendOKResponse(RoutingContext routingContext, String response) {
        sendResponse(routingContext, 200, response, response, true);
    }

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
            logger.debug("{} - {}", routingContext.currentRoute().getPath(), logMessage);
        } else {
            logger.warn("{} - {}", routingContext.currentRoute().getPath(), logMessage);
        }
    }

    protected void sendOKPDFResponse(RoutingContext routingContext, String logMessage, String fileName, byte[] data) {
        routingContext.response()
                .putHeader("Content-Type", "application/pdf")
                .putHeader("Content-Disposition", "inline; filename=" + fileName)
                .setStatusCode(200)
                .end(Buffer.buffer(data));
        logger.debug("{} - {}", routingContext.currentRoute().getPath(), logMessage);
    }

    protected void sendOKImageResponse(RoutingContext routingContext, String logMessage, byte[] data) {
        routingContext.response()
                .putHeader("Content-Type", "image/png")
                .putHeader("Content-Length", String.valueOf(data.length))
                .end(Buffer.buffer(data));
        logger.debug("{} - {}", routingContext.currentRoute().getPath(), logMessage);
    }

    protected boolean isInvalidUsername(RoutingContext routingContext, String userName) {
        if (userName == null || userName.trim().isEmpty()) {
            sendBadRequestResponse(routingContext, "Username is mandatory to perform operations");
            return true;
        }
        logger.debug("{} made a request for path: {}", userName, routingContext.currentRoute().getPath());
        return false;
    }


    protected byte[] getFileContent(String fileName) {
        byte[] fileContent = new byte[0];
        try (InputStream inputStream = getClass().getClassLoader()
                .getResourceAsStream(fileName)) {
            if (inputStream == null) {
                logger.warn("File not found: {}", fileName);
                return fileContent;
            }

            fileContent = inputStream.readAllBytes();
        } catch (IOException e) {
            logger.warn("Could not load file: {}", fileName);
        }
        return fileContent;
    }

}

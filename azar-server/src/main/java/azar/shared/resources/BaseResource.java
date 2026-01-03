package azar.shared.resources;

import java.io.IOException;
import java.io.InputStream;
import io.vertx.ext.web.RoutingContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public abstract class BaseResource {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Context
    RoutingContext routingContext;

    protected Response ok(Object response) {
        return sendResponse(Response.Status.OK, response, "", true);
    }

    protected Response ok(Object response, String logMessage) {
        return sendResponse(Response.Status.OK, response, logMessage, true);
    }

    protected Response created(Object response, String logMessage) {
        return sendResponse(Response.Status.CREATED, response, logMessage, true);
    }

    protected Response badRequest(String logMessage) {
        return sendResponse(Response.Status.BAD_REQUEST, Response.Status.BAD_REQUEST.getReasonPhrase(), logMessage, false);
    }

    protected Response unauthorized(String logMessage) {
        return sendResponse(Response.Status.UNAUTHORIZED, Response.Status.UNAUTHORIZED.getReasonPhrase(), logMessage, false);
    }

    protected Response notFound(String logMessage) {
        return sendResponse(Response.Status.NOT_FOUND, Response.Status.NOT_FOUND.getReasonPhrase(), logMessage, false);
    }

    protected Response internalError(String logMessage) {
        return sendResponse(Response.Status.INTERNAL_SERVER_ERROR, Response.Status.INTERNAL_SERVER_ERROR.getReasonPhrase(), logMessage, false);
    }


    private Response sendResponse(Response.Status statusCode, Object responseEntity, String logMessage,
                                  boolean isOk) {
        String responseMessage = "%s - %s".formatted(routingContext.normalizedPath(), logMessage);

        if (isOk) {
            logger.debug(responseMessage);
        } else {
            logger.warn(responseMessage);
        }

        // Decide JSON media type based on client headers: honor application/gson+json if explicitly requested
        String jsonMedia = "application/json";
        try {
            if (routingContext != null && routingContext.request() != null) {
                String accept = routingContext.request().getHeader("Accept");
                String contentType = routingContext.request().getHeader("Content-Type");
                if ((accept != null && accept.contains("application/gson+json")) ||
                        (contentType != null && contentType.contains("application/gson+json"))) {
                    jsonMedia = "application/gson+json";
                }
            }
        } catch (Exception ignore) { /* default to application/json */ }

        Response.ResponseBuilder responseBuilder = Response.status(statusCode)
                .header("Content-Type", jsonMedia);

        if (responseEntity != null) {
            responseBuilder.entity(responseEntity);
            responseBuilder.type(jsonMedia);
        }

        return responseBuilder.build();
    }

    protected Response okPdf(String logMessage, String fileName, byte[] data) {
        logger.debug("{} - {}", routingContext.currentRoute().getPath(), logMessage);
        return Response.status(Response.Status.OK)
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=" + fileName)
                .entity(data)
                .type("application/pdf")
                .build();
    }

    protected Response okImage(String logMessage, byte[] data) {
        logger.debug("{} - {}", routingContext.currentRoute().getPath(), logMessage);
        return Response.status(Response.Status.OK)
                .header("Content-Type", "image/png")
                .header("Content-Length", String.valueOf(data.length))
                .entity(data)
                .type("image/png")
                .build();
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

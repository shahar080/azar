package azar.verticals.routers;

import azar.dal.service.PdfFileService;
import azar.entities.db.PdfFile;
import azar.utils.JsonManager;
import azar.utils.Utilities;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class PdfRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final PdfFileService pdfFileService;
    private final JsonManager jsonManager;

    @Inject
    public PdfRouter(PdfFileService pdfFileService, JsonManager jsonManager) {
        this.pdfFileService = pdfFileService;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx) {
        Router pdfRouter = Router.router(vertx);

        pdfRouter.route("/upload").handler(this::handlePdfUpload);
        pdfRouter.route("/getAll").handler(this::handleGetAllPdfs);
        pdfRouter.route("/delete/:id").handler(this::handleDeletePdf);
        pdfRouter.route("/update").handler(this::handleUpdatePdf);
        pdfRouter.route("/thumbnail/:id").handler(routingContext -> handleThumbnailRequest(routingContext, vertx));
        pdfRouter.route("/get/:id").handler(this::handlePDFGet);

        return pdfRouter;
    }


    private void handlePdfUpload(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        List<FileUpload> fileUploads = routingContext.fileUploads();
        if (fileUploads.isEmpty()) {
            routingContext.response()
                    .setStatusCode(400).end("No file uploaded");
            return;
        }

        FileUpload fileUpload = fileUploads.getFirst();
        String uploadedFilePath = fileUpload.uploadedFileName();

        routingContext.vertx().fileSystem().readFile(uploadedFilePath)
                .onSuccess(buffer -> {
                    PdfFile pdfFile = new PdfFile();
                    pdfFile.setFileName(fileUpload.fileName());
                    pdfFile.setData(buffer.getBytes());
                    pdfFile.setContentType(fileUpload.contentType());
                    pdfFile.setLabels(new ArrayList<>());
                    pdfFile.setSize(Utilities.getHumanReadableSize(buffer.getBytes()));

                    try {
                        pdfFileService.add(pdfFile)
                                .onSuccess(savedPdfFile -> {
                                    savedPdfFile.setData(new byte[0]);
                                    routingContext.response()
                                            .setStatusCode(201).end(jsonManager.toJson(savedPdfFile));
                                    logger.info("File {} uploaded successfully", savedPdfFile.getFileName());
                                })
                                .onFailure(err -> sendErrorResponse(routingContext, "Error saving" + fileUpload.fileName(), err.getMessage()));
                    } catch (Exception e) {
                        sendErrorResponse(routingContext, "Error saving" + fileUpload.fileName(), e.getMessage());
                    }
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to read uploaded file" + fileUpload.fileName(), err.getMessage()));
    }

    private void handleGetAllPdfs(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Default values for pagination
        int page = Integer.parseInt(routingContext.queryParams().get("page"));
        int limit = Integer.parseInt(routingContext.queryParams().get("limit"));

        if (page < 1 || limit < 1) {
            routingContext.response()
                    .setStatusCode(400)
                    .end("Page and limit must be greater than 0.");
            return;
        }

        int offset = (page - 1) * limit;

        pdfFileService.getAllClientPaginated(offset, limit) // Fetch paginated results
                .onSuccess(pdfFiles -> {
                    routingContext.response()
                            .setStatusCode(200)
                            .putHeader("Content-Type", "application/json")
                            .end(jsonManager.toJson(pdfFiles));
                    logger.info("Returned {} PDFs to client (page: {}, limit: {})", pdfFiles.size(), page, limit);
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Error getting PDFs from DB", err.getMessage()));
    }

    private void handleDeletePdf(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Extract the PDF ID from the request path
        String pdfId = routingContext.pathParam("id");
        if (pdfId == null || pdfId.isEmpty()) {
            routingContext.response()
                    .setStatusCode(400)
                    .end("PDF ID is required");
            return;
        }

        // Call the service to delete the PDF
        pdfFileService.removeById(Integer.valueOf(pdfId))
                .onSuccess(success -> {
                    if (success) {
                        logger.info("Successfully deleted PDF with ID: {}", pdfId);
                        routingContext.response()
                                .setStatusCode(200)
                                .end("PDF deleted successfully");
                    } else {
                        sendErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId, "Failed to delete PDF with ID: " + pdfId);
                    }
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId, err.getMessage()));
    }

    private void handleUpdatePdf(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());
        PdfFile pdfFile = jsonManager.fromJson(routingContext.body().asString(), PdfFile.class);
        pdfFileService.update(pdfFile)
                .onSuccess(dbPdfFile -> {
                    logger.info("Sending updated PDF {} back", pdfFile.getId());
                    routingContext.response()
                            .setStatusCode(200)
                            .end(jsonManager.toJson(dbPdfFile));
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to update PDF with ID: " + pdfFile.getId(), err.getMessage()));
    }

    public void handleThumbnailRequest(RoutingContext routingContext, Vertx vertx) {
        String pdfId = routingContext.pathParam("id");
        pdfFileService.getById(Integer.valueOf(pdfId))
                .onSuccess(pdfFile -> {
                    if (pdfFile == null) {
                        routingContext.response()
                                .setStatusCode(404)
                                .end("PDF not found");
                        return;
                    }

                    try {
                        vertx.executeBlocking(() -> {
                            // Generate the thumbnail as a byte array
                            byte[] thumbnail = Utilities.generateThumbnail(pdfFile);

                            // Set the response headers before writing content
                            routingContext.response()
                                    .putHeader("Content-Type", "image/png")
                                    .putHeader("Content-Length", String.valueOf(thumbnail.length));

                            // Write the thumbnail data
                            routingContext.response().write(Buffer.buffer(thumbnail));

                            // End the response after writing
                            routingContext.response().end();
                            return null;
                        });
                    } catch (Exception e) {
                        sendErrorResponse(routingContext, "Failed to generate thumbnail: " + pdfFile.getId(), e.getMessage());
                    }
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Error retrieving PDF: " + pdfId, err.getMessage()));
    }

    private void handlePDFGet(RoutingContext routingContext) {
        String pdfId = routingContext.pathParam("id");

        // Fetch the PDF file from your database/service
        pdfFileService.getById(Integer.valueOf(pdfId))
                .onSuccess(pdfFile -> {
                    if (pdfFile == null) {
                        routingContext.response().setStatusCode(404).end("PDF not found");
                        return;
                    }

                    // Send the PDF data
                    routingContext.response()
                            .putHeader("Content-Type", "application/pdf")
                            .putHeader("Content-Disposition", "inline; filename=" + pdfFile.getFileName())
                            .end(Buffer.buffer(pdfFile.getData()));
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to retrieve PDF: " + pdfId, err.getMessage()));
    }

}

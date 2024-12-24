package azar.verticals.routers;

import azar.dal.service.PdfFileService;
import azar.dal.service.UserService;
import azar.entities.db.PdfFile;
import azar.entities.requests.BaseRequest;
import azar.entities.requests.pdf.PdfUpdateRequest;
import azar.utils.CacheManager;
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
import java.util.Objects;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class PdfRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final PdfFileService pdfFileService;
    private final UserService userService;
    private final JsonManager jsonManager;
    private final CacheManager redisAPI;
    private final Vertx vertx;

    @Inject
    public PdfRouter(PdfFileService pdfFileService, UserService userService, JsonManager jsonManager, CacheManager cacheManager, Vertx vertx) {
        this.pdfFileService = pdfFileService;
        this.userService = userService;
        this.jsonManager = jsonManager;
        this.redisAPI = cacheManager;
        this.vertx = vertx;
    }

    public Router create(Vertx vertx) {
        Router pdfRouter = Router.router(vertx);

        pdfRouter.route("/upload").handler(this::handlePdfUpload);
        pdfRouter.route("/getAll").handler(this::handleGetAllPdfs);
        pdfRouter.route("/delete/:id").handler(this::handleDeletePdfById);
        pdfRouter.route("/update").handler(this::handleUpdatePdf);
        pdfRouter.route("/thumbnail/:id").handler(this::handleThumbnailRequest);
        pdfRouter.route("/get/:id").handler(this::handlePDFGet);

        return pdfRouter;
    }


    private void handlePdfUpload(RoutingContext routingContext) {
        String userName = routingContext.request().getFormAttribute("userName");
        if (isInvalidUsername(routingContext, userName)) return;

        List<FileUpload> fileUploads = routingContext.fileUploads();
        if (fileUploads.isEmpty()) {
            sendBadRequestResponse(routingContext, "No file uploaded");
            return;
        }

        FileUpload fileUpload = fileUploads.getFirst();
        String uploadedFilePath = fileUpload.uploadedFileName();

        routingContext.vertx().fileSystem().readFile(uploadedFilePath)
                .onSuccess(buffer -> {
                    PdfFile pdfFile = new PdfFile();
                    pdfFile.setUploadedBy(userName);
                    pdfFile.setFileName(fileUpload.fileName());
                    pdfFile.setData(buffer.getBytes());
                    pdfFile.setContentType(fileUpload.contentType());
                    pdfFile.setLabels(new ArrayList<>());
                    pdfFile.setSize(Utilities.getHumanReadableSize(buffer.getBytes()));

                    try {
                        Utilities.generateThumbnail(pdfFile, vertx)
                                .onSuccess(thumbnail -> {
                                    pdfFile.setThumbnail(thumbnail); // TODO: 22/12/2024 AZAR-64
                                    pdfFileService.add(pdfFile)
                                            .onSuccess(savedPdfFile -> {
                                                savedPdfFile.setData(new byte[0]);
                                                sendCreatedResponse(routingContext, jsonManager.toJson(savedPdfFile),
                                                        "File %s uploaded successfully by %s".formatted(savedPdfFile.getFileName(), userName));
                                            })
                                            .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error saving " + fileUpload.fileName()));
                                })
                                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error generating thumbnail for " + fileUpload.fileName()));
                    } catch (Exception err) {
                        sendInternalErrorResponse(routingContext, "Unexpected error while processing " + fileUpload.fileName());
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to read uploaded file " + fileUpload.fileName()))
                .eventually(() -> routingContext.vertx().fileSystem().delete(uploadedFilePath)
                        .onSuccess(_ -> logger.info("Temporary file deleted: {}", uploadedFilePath))
                        .onFailure(err -> logger.warn("Failed to delete temporary file: {}", uploadedFilePath, err)));
    }

    private void handleGetAllPdfs(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        // Default values for pagination
        int page = Integer.parseInt(routingContext.queryParams().get("page"));
        int limit = Integer.parseInt(routingContext.queryParams().get("limit"));

        if (page < 1 || limit < 1) {
            sendBadRequestResponse(routingContext, "Page and limit must be greater than 0.");
            return;
        }

        int offset = (page - 1) * limit;

        pdfFileService.getAllClientPaginated(offset, limit) // Fetch paginated results
                .onSuccess(pdfFiles -> sendOKResponse(routingContext, jsonManager.toJson(pdfFiles),
                        "Returned %s PDFs to client (page: %s, limit: %s)".formatted(pdfFiles.size(), page, limit)))
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error getting PDFs from DB"));
    }

    private void handleDeletePdfById(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        // Extract the PDF ID from the request path
        String pdfId = routingContext.pathParam("id");
        if (pdfId == null || pdfId.isEmpty()) {
            sendBadRequestResponse(routingContext, "PDF ID is required");
            return;
        }

        pdfFileService.getOwnerByPdfId(Integer.valueOf(pdfId))
                .onSuccess(dbPdfOwner -> {
                    if (!Objects.equals(currentUser, dbPdfOwner)) {
                        userService.isAdmin(currentUser)
                                .onSuccess(isAdmin -> {
                                    if (isAdmin) {
                                        removePdfById(routingContext, pdfId);
                                    } else {
                                        sendUnauthorizedErrorResponse(routingContext, "Deleting other people PDFs isn't allowed unless you're admin");
                                    }
                                })
                                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId));
                    } else {
                        removePdfById(routingContext, pdfId);
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId));
    }

    private void removePdfById(RoutingContext routingContext, String pdfId) {
        pdfFileService.removeById(Integer.valueOf(pdfId))
                .onSuccess(success -> {
                    if (success) {
                        sendOKResponse(routingContext, "PDF deleted successfully", "Successfully deleted PDF with ID: %s".formatted(pdfId));
                    } else {
                        sendInternalErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId);
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to delete PDF with ID: " + pdfId));
    }

    private void handleUpdatePdf(RoutingContext routingContext) {
        PdfUpdateRequest pdfUpdateRequest = jsonManager.fromJson(routingContext.body().asString(), PdfUpdateRequest.class);
        String currentUser = pdfUpdateRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        PdfFile pdfFile = pdfUpdateRequest.getPdfFile();
        pdfFileService.updatePartial(pdfFile)
                .onSuccess(isSuccess -> {
                    if (isSuccess) {
                        sendOKResponse(routingContext, jsonManager.toJson(pdfFile),
                                "Sending updated PDF %s back".formatted(pdfFile.getId()));
                    } else {
                        sendInternalErrorResponse(routingContext, "Failed to update PDF with ID: " + pdfFile.getId());
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to update PDF with ID: " + pdfFile.getId()));
    }

    public void handleThumbnailRequest(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String pdfId = routingContext.pathParam("id");
        byte[] cachedThumbnail = redisAPI.get("thumbnail:" + pdfId);

        if (cachedThumbnail != null) {
            logger.info("Sending cached thumbnail for {}", pdfId);
            sendThumbnailResponse(routingContext, cachedThumbnail);
        } else {
            logger.info("Calculating thumbnail for {}", pdfId);
            pdfFileService.getThumbnailById(Integer.valueOf(pdfId))
                    .onSuccess(dbThumbnail -> {
                        redisAPI.put("thumbnail:" + pdfId, dbThumbnail);
                        logger.info("Sending thumbnail for {}", pdfId);
                        sendThumbnailResponse(routingContext, dbThumbnail);
                    })
                    .onFailure(_ -> sendInternalErrorResponse(routingContext, "Database error"));
        }
    }

    private void sendThumbnailResponse(RoutingContext routingContext, byte[] thumbnail) {
        routingContext.response()
                .putHeader("Content-Type", "image/png")
                .putHeader("Content-Length", String.valueOf(thumbnail.length))
                .end(Buffer.buffer(thumbnail));
    }

    private void handlePDFGet(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String pdfId = routingContext.pathParam("id");

        // Fetch the PDF file from your database/service
        pdfFileService.getById(Integer.valueOf(pdfId))
                .onSuccess(pdfFile -> {
                    if (pdfFile == null) {
                        sendNotFoundResponse(routingContext, "PDF not found");
                        return;
                    }

                    // Send the PDF data
                    routingContext.response()
                            .putHeader("Content-Type", "application/pdf")
                            .putHeader("Content-Disposition", "inline; filename=" + pdfFile.getFileName())
                            .end(Buffer.buffer(pdfFile.getData()));
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to retrieve PDF: " + pdfId));
    }

}

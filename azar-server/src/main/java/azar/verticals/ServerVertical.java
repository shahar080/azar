package azar.verticals;

import azar.dal.service.PdfFileService;
import azar.dal.service.UserService;
import azar.entities.LoginResponse;
import azar.entities.db.PdfFile;
import azar.entities.db.User;
import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.AddUserRequest;
import azar.properties.AppProperties;
import azar.utils.AuthService;
import azar.utils.JsonManager;
import azar.utils.PasswordManager;
import azar.utils.Utilities;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.PemKeyCertOptions;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;


/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class ServerVertical extends AbstractVerticle {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;
    private final JsonManager jsonManager;
    private final UserService userService;
    private final PdfFileService pdfFileService;
    private final AuthService authService;
    private final JWTAuth jwtAuth;
    private final PasswordManager passwordManager;

    @Inject
    public ServerVertical(AppProperties appProperties, JsonManager jsonManager, UserService userService,
                          PdfFileService pdfFileService, PasswordManager passwordManager) {
        this.appProperties = appProperties;
        this.userService = userService;
        this.pdfFileService = pdfFileService;
        this.jsonManager = jsonManager;
        this.authService = new AuthService(this.vertx);
        this.jwtAuth = authService.getJwtAuth();
        this.passwordManager = passwordManager;
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router router = Router.router(vertx);
            // TODO: 13/12/2024 AZAR-1
            router.route().handler(CorsHandler.create()
                    .addOrigin("*")// Allow requests from this origin
                    .allowedMethod(HttpMethod.GET)           // Allow GET requests
                    .allowedMethod(HttpMethod.POST)          // Allow POST requests
                    .allowedMethod(HttpMethod.OPTIONS)          // Allow POST requests
                    .allowedHeader("Content-Type")           // Allow Content-Type header
                    .allowedHeader("Authorization")          // Allow Authorization header
                    .allowedHeader("Access-Control-Allow-Origin") // Allow Access-Control-Allow-Origin header
                    .allowedHeader("Access-Control-Allow-Methods") // Allow Allowed Methods header
                    .allowedHeader("Access-Control-Allow-Headers") // Allow Allowed Headers
                    .maxAgeSeconds(3600)  // Cache CORS preflight response for 1 hour
            );

//            // Set up the HttpServer with SSL enabled
//            PemKeyCertOptions pemOptions = new PemKeyCertOptions()
//                    .setKeyPath(appProperties.getProperty("CERT_KEY_PATH"))   // Private key in PEM format
//                    .setCertPath(appProperties.getProperty("CERT_VALUE_PATH"));  // Certificate in PEM format
//
//            HttpServerOptions options = new HttpServerOptions()
//                    .setSsl(true)
//                    .setKeyCertOptions(pemOptions);  // SSL configuration using PEM certificates

            router.route().handler(BodyHandler.create()
                    .setBodyLimit((long) appProperties.getIntProperty("server.file.max.size.mb", 50)
                            * 1024 * 1024));
            router.route("/user/ops/*").handler(JWTAuthHandler.create(jwtAuth));
            router.post("/refresh").handler(this::handleRefreshToken);
            router.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));
            router.route("/user/ops/add").handler(this::handleAddUser);
            router.route("/user/login").handler(this::handleUserLogin);
            router.route("/pdf/upload").handler(this::handlePdfUpload);
            router.route("/pdf/getAll").handler(this::handleGetAllPdfs);
            router.route("/pdf/delete/:id").handler(this::handleDeletePdf);
            router.route("/pdf/update").handler(this::handleUpdatePdf);
            router.route("/pdf/thumbnail/:id").handler(this::handleThumbnailRequest);
            router.route("/pdf/get/:id").handler(this::handlePDFGet);

            router.route().method(HttpMethod.OPTIONS).handler(routingContext -> {
                routingContext.response()
                        .putHeader("Access-Control-Allow-Origin", "*")
                        .putHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                        .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                        .setStatusCode(200)
                        .end();
            });

            int serverPort = appProperties.getIntProperty("server.port", 8080);
            String serverHost = appProperties.getProperty("server.host");

            vertx
                    .createHttpServer()
                    .requestHandler(router)
                    .listen(
                            serverPort,
                            "0.0.0.0"
                    ).onSuccess(ignored -> {
                        logger.info("1Server is up and listening on {}", String.format("%s:%s", serverHost, serverPort));
                        startPromise.complete();
                    })
                    .onFailure(err -> {
                        logger.error("Server failed to start due to", err);
                        startPromise.fail(err);
                    });
        } catch (Exception e) {
            logger.error("Server failed to start due to", e);
        }
    }

    public JsonObject decodeToken(String token) {
        try {
            // Split the token into parts (header.payload.signature)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            // Decode the payload (second part) from Base64
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return new JsonObject(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to decode token", e);
        }
    }

    private void handleRefreshToken(RoutingContext ctx) {
        String authHeader = ctx.request().getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.response()
                    .setStatusCode(401)
                    .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
            return;
        }

        String token = authHeader.substring("Bearer ".length());

        try {
            // Decode token without enforcing expiration checks
            JsonObject decodedToken = decodeToken(token);

            // Extract user information (e.g., username) from the decoded token
            String username = decodedToken.getString("userName");
            if (username == null) {
                ctx.response()
                        .setStatusCode(401)
                        .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
                return;
            }

            if (userService.getUserByUserName(username) == null) {
                ctx.response()
                        .setStatusCode(401)
                        .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
                return;
            }

            // Generate a new token
            String newToken = jwtAuth.generateToken(
                    new JsonObject().put("username", username),
                    new JWTOptions().setExpiresInSeconds(3600) // New token valid for 1 hour
            );

            ctx.response()
                    .setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("token", newToken).encode());

        } catch (Exception e) {
            // Handle decoding errors or invalid tokens
            ctx.response()
                    .setStatusCode(401)
                    .end(new JsonObject().put("error", "Invalid or expired token").encode());
        }
    }

    private void handleAddUser(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Parse JSON body to User
        AddUserRequest addUserRequest = jsonManager.fromJson(routingContext.body().asString(), AddUserRequest.class);

        userService.getUserByUserName(addUserRequest.currentUser())
                .onSuccess(dbUser -> {
                    if (dbUser == null) {
                        sendErrorResponse(routingContext, 400, "BAD_REQUEST", "Received bad data from client!");
                        return;
                    }
                    if (!dbUser.isAdmin()) {
                        sendErrorResponse(routingContext, 401, "UNAUTHORIZED", "User %s is not authorized to add users!".formatted(dbUser.getUserName()));
                        return;
                    }
                    User user = addUserRequest.userToAdd();
                    // Validate user data
                    if (userService.isInvalidUser(user)) {
                        sendErrorResponse(routingContext, 400, "BAD_REQUEST", "Received bad data from client!");
                        return;
                    }

                    // Check if username already exists
                    userService.getUserByUserName(user.getUserName())
                            .onSuccess(existingUser -> {
                                if (existingUser != null) {
                                    sendErrorResponse(routingContext, 400, "Username already exists!", "Username '{}' already exists!", user.getUserName());
                                } else {
                                    // Add user to the system
                                    addUser(routingContext, user);
                                }
                            })
                            .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while handling add user: {}", err.getMessage()));
                })
                .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while handling add user: {}", err.getMessage()));
    }

    private void addUser(RoutingContext routingContext, User user) {
        user.setPassword(passwordManager.hashPassword(user.getPassword()));
        userService.add(user)
                .onSuccess(addedUser -> {
                    routingContext.response()
                            .setStatusCode(201)
                            .putHeader("Content-Type", "application/json")
                            .end(jsonManager.toJson(addedUser.getId(), Integer.class));
                    logger.info("User '{}' has registered successfully.", user.getUserName());
                })
                .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while adding user: {}", err.getMessage()));
    }

    private void handleUserLogin(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Parse JSON body to UserNameAndPassword
        UserNameAndPassword userNameAndPassword = jsonManager.fromJson(routingContext.body().asString(), UserNameAndPassword.class);

        if (userNameAndPassword == null) {
            sendErrorResponse(routingContext, 400, "BAD_REQUEST", "Received bad data from client!");
            return;
        }

        userService.getUserByUserName(userNameAndPassword.getUserName())
                .onSuccess(user -> {
                    if (user != null && passwordManager.checkPassword(userNameAndPassword.getPassword(), user.getPassword())) {
                        String token = jwtAuth.generateToken(
                                new JsonObject().put("userName", user.getUserName()),
                                new JWTOptions().setExpiresInSeconds(3600)
                        );

                        LoginResponse response = new LoginResponse(true, token, user.getUserName(), user.getUserType());
                        routingContext.response()
                                .setStatusCode(200)
                                .putHeader("Content-Type", "application/json")
                                .end(jsonManager.toJson(response));
                        logger.info("User '{}' has logged in successfully.", user.getUserName());
                    } else {
                        sendErrorResponse(routingContext, 401, "Unauthorized", "Wrong username or password.");
                    }
                })
                .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while retrieving user by username: {}", err.getMessage()));
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
                                .onFailure(err -> {
                                    logger.error("Error saving {}", fileUpload.fileName(), err);
                                    routingContext.response()
                                            .setStatusCode(500).end("Database save failed: " + err.getMessage());
                                });
                    } catch (Exception e) {
                        logger.error("Error saving {}", fileUpload.fileName(), e);
                        routingContext.response()
                                .setStatusCode(500).end("Database save failed: " + e.getMessage());
                    }
                })
                .onFailure(err -> {
                    logger.error("Failed to read uploaded file {}", fileUpload.fileName(), err);
                    routingContext.response()
                            .setStatusCode(500).end("File read failed: " + err.getMessage());
                });
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
                .onFailure(err -> {
                    logger.error("Error getting PDFs from DB", err);
                    routingContext.response()
                            .setStatusCode(500)
                            .end("Error getting PDFs: " + err.getMessage());
                });
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
                        logger.error("Failed to delete PDF with ID: {}", pdfId);
                        routingContext.response()
                                .setStatusCode(500)
                                .end("Failed to delete PDF");
                    }
                })
                .onFailure(err -> {
                    logger.error("Failed to delete PDF with ID: {}", pdfId, err);
                    routingContext.response()
                            .setStatusCode(500)
                            .end("Failed to delete PDF: " + err.getMessage());
                });
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
                .onFailure(err -> {
                    logger.error("Failed to update PDF with ID: {}", pdfFile.getId(), err);
                    routingContext.response()
                            .setStatusCode(500)
                            .end("Failed to delete PDF: " + err.getMessage());
                });
    }

    public void handleThumbnailRequest(RoutingContext routingContext) {
        pdfFileService.getById(Integer.valueOf(routingContext.pathParam("id")))
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
                        routingContext.response()
                                .setStatusCode(500)
                                .end("Failed to generate thumbnail: " + e.getMessage());
                    }
                })
                .onFailure(err -> {
                    routingContext.response()
                            .setStatusCode(500)
                            .end("Error retrieving PDF: " + err.getMessage());
                });
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
                .onFailure(err -> {
                    routingContext.response().setStatusCode(500).end("Failed to retrieve PDF: " + err.getMessage());
                });
    }

    private void sendErrorResponse(RoutingContext routingContext, int statusCode, String message, String
            logMessage, Object... logParams) {
        routingContext.response()
                .setStatusCode(statusCode)
                .putHeader("Content-Type", "application/json")
                .end(message);
        logger.warn(logMessage, logParams);
    }
}

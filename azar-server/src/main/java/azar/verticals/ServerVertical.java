package azar.verticals;

import azar.dal.service.UserService;
import azar.entities.LoginResponse;
import azar.entities.db.User;
import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.AddUserRequest;
import azar.properties.AppProperties;
import azar.utils.AuthService;
import azar.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Base64;


/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class ServerVertical
 **/
public class ServerVertical extends AbstractVerticle {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;
    private final JsonManager jsonManager;
    private final UserService userService;
    private final AuthService authService;
    private final JWTAuth jwtAuth;

    @Inject
    public ServerVertical(AppProperties appProperties, JsonManager jsonManager, UserService userService) {
        this.appProperties = appProperties;
        this.userService = userService;
        this.jsonManager = jsonManager;
        this.authService = new AuthService(this.vertx);
        this.jwtAuth = authService.getJwtAuth();
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router router = Router.router(vertx);
            // TODO: 13/12/2024 AZAR-1
            router.route().handler(CorsHandler.create() // Allow all origins; replace "*" with specific domains if needed
                    .allowedMethod(HttpMethod.GET)            // Allow GET requests
                    .allowedMethod(HttpMethod.POST)           // Allow POST requests
                    .allowedHeader("Content-Type")            // Allow Content-Type header
                    .allowedHeader("Authorization")           // Allow Authorization header, if needed
                    .allowedHeader("Access-Control-Allow-Origin") // Required for some browsers
            );

            router.route().handler(BodyHandler.create());
            router.route("/user/ops/*").handler(JWTAuthHandler.create(jwtAuth));


            router.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));
            router.post("/refresh").handler(this::handleRefreshToken);
            router.route("/user/ops/add").handler(this::handleAddUser);
            router.route("/user/login").handler(this::handleUserLogin);


            int serverPort = appProperties.getIntProperty("server.port", 8080);
            String serverHost = appProperties.getProperty("server.host");

            vertx
                    .createHttpServer()
                    .requestHandler(router)
                    .listen(
                            serverPort,
                            serverHost
                    ).onSuccess(ignored -> {
                        logger.info("Server is up and listening on {}", String.format("%s:%s", serverHost, serverPort));
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
                    if (user != null && user.getPassword().equals(userNameAndPassword.getPassword())) {
                        String token = jwtAuth.generateToken(
                                new JsonObject().put("userName", user.getUserName()),
                                new JWTOptions().setExpiresInSeconds(3600)
                        );

                        LoginResponse response = new LoginResponse(true, token, user.getUserType());
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

    private void sendErrorResponse(RoutingContext routingContext, int statusCode, String message, String logMessage, Object... logParams) {
        routingContext.response()
                .setStatusCode(statusCode)
                .putHeader("Content-Type", "application/json")
                .end(message);
        logger.warn(logMessage, logParams);
    }
}

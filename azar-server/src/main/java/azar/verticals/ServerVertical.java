package azar.verticals;

import azar.dal.entities.db.User;
import azar.dal.entities.db.UserNameAndPassword;
import azar.dal.service.UserService;
import azar.properties.AppProperties;
import azar.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


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

    @Inject
    public ServerVertical(AppProperties appProperties, JsonManager jsonManager, UserService userService) {
        this.appProperties = appProperties;
        this.userService = userService;
        this.jsonManager = jsonManager;
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router router = Router.router(vertx);
            router.route().handler(BodyHandler.create());

            // TODO: 13/12/2024 AZAR-1
            router.route().handler(CorsHandler.create() // Allow all origins; replace "*" with specific domains if needed
                    .allowedMethod(HttpMethod.GET)            // Allow GET requests
                    .allowedMethod(HttpMethod.POST)           // Allow POST requests
                    .allowedHeader("Content-Type")            // Allow Content-Type header
                    .allowedHeader("Authorization")           // Allow Authorization header, if needed
                    .allowedHeader("Access-Control-Allow-Origin") // Required for some browsers
            );

            router.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));
            router.route("/user/add").handler(this::handleAddUser);
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

    private void handleAddUser(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Parse JSON body to User
        User user = jsonManager.fromJson(routingContext.body().asString(), User.class);

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
                .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while retrieving user by username: {}", err.getMessage()));
    }

    private void addUser(RoutingContext routingContext, User user) {
        userService.add(user)
                .onSuccess(addedUser -> {
                    routingContext.response()
                            .setStatusCode(200)
                            .putHeader("Content-Type", "application/json")
                            .end(jsonManager.toJson(addedUser.getId(), Integer.class));
                    logger.info("User '{}' has registered successfully.", user.getUserName());
                })
                .onFailure(err -> sendErrorResponse(routingContext, 500, "Internal server error!", "Error while adding user: {}", err.getMessage()));
    }

    private void handleUserLogin(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        // Parse JSON body to User
        UserNameAndPassword userNameAndPassword = jsonManager.fromJson(routingContext.body().asString(), UserNameAndPassword.class);

        if (userNameAndPassword == null) {
            sendErrorResponse(routingContext, 400, "BAD_REQUEST", "Received bad data from client!");
            return;
        }

        // Check if username already exists
        userService.getUserByUserName(userNameAndPassword.getUserName())
                .onSuccess(user -> {
                    if (user != null) {
                        if (user.getPassword().equals(userNameAndPassword.getPassword())) {
                            routingContext.response()
                                    .setStatusCode(200)
                                    .putHeader("Content-Type", "application/json")
                                    .end(jsonManager.toJson(true, Boolean.class));
                            logger.info("User '{}' has logged in successfully.", user.getUserName());
                        } else {
                            sendErrorResponse(routingContext, 401, "Wrong username or password", "Wrong username or password. Username: {}", userNameAndPassword.getUserName());
                        }
                    } else {
                        // Add user to the system
                        sendErrorResponse(routingContext, 400, "Username doesn't exists!", "Username '{}' doesn't exists!", userNameAndPassword.getUserName());
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

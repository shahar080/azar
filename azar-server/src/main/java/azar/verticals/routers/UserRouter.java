package azar.verticals.routers;

import azar.dal.service.UserService;
import azar.entities.LoginResponse;
import azar.entities.db.User;
import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.AddUserRequest;
import azar.utils.JsonManager;
import azar.utils.PasswordManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class UserRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final UserService userService;
    private final JsonManager jsonManager;
    private final PasswordManager passwordManager;
    private final JWTAuth jwtAuth;

    @Inject
    public UserRouter(UserService userService, JsonManager jsonManager, PasswordManager passwordManager,
                      JWTAuth jwtAuth) {
        this.userService = userService;
        this.jsonManager = jsonManager;
        this.passwordManager = passwordManager;
        this.jwtAuth = jwtAuth;
    }

    public Router create(Vertx vertx) {
        Router userRouter = Router.router(vertx);

        userRouter.route("/ops/*").handler(JWTAuthHandler.create(jwtAuth));
        userRouter.route("/login").handler(this::handleUserLogin);
        userRouter.route("/ops/add").handler(this::handleAddUser);

        return userRouter;
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

}

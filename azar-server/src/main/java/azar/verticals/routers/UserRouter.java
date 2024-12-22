package azar.verticals.routers;

import azar.dal.service.UserService;
import azar.entities.LoginResponse;
import azar.entities.db.User;
import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.AddUserRequest;
import azar.utils.AuthService;
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
                      AuthService authService) {
        this.userService = userService;
        this.jsonManager = jsonManager;
        this.passwordManager = passwordManager;
        this.jwtAuth = authService.getJwtAuth();
    }

    public Router create(Vertx vertx) {
        Router userRouter = Router.router(vertx);

        userRouter.route("/ops/*").handler(JWTAuthHandler.create(jwtAuth));
        userRouter.route("/login").handler(this::handleUserLogin);
        userRouter.route("/getAll").handler(this::getAllUsers);
        userRouter.route("/ops/add").handler(this::handleAddUser);
        userRouter.route("/ops/update").handler(this::handleUpdateUser);
        userRouter.route("/ops/delete/:id").handler(this::handleDeleteUser);

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

    private void getAllUsers(RoutingContext routingContext) {
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

        userService.getAllClientPaginated(offset, limit) // Fetch paginated results
                .onSuccess(users -> {
                    routingContext.response()
                            .setStatusCode(200)
                            .putHeader("Content-Type", "application/json")
                            .end(jsonManager.toJson(users));
                    logger.info("Returned {} users to client (page: {}, limit: {})", users.size(), page, limit);
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Error getting users from DB", err.getMessage()));
    }

    private void handleDeleteUser(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());

        String userId = routingContext.pathParam("id");
        if (userId == null || userId.isEmpty()) {
            routingContext.response()
                    .setStatusCode(400)
                    .end("user ID is required");
            return;
        }

        userService.getById(Integer.valueOf(userId))
                .onSuccess(dbUser -> {
                    String initiatorUsername = jsonManager.fromJson(routingContext.body().asString(), String.class);

                    if (dbUser.getUserName().equalsIgnoreCase(initiatorUsername)) {
                        sendErrorResponse(routingContext, 400, "Current user can't delete itself", "Current user can't delete itself");
                        return;
                    }

                    if (dbUser.getUserName().equalsIgnoreCase("admin")) {
                        sendErrorResponse(routingContext, 401, "User admin can't be deleted", "User admin can't be deleted");
                        return;
                    }

                    userService.removeById(Integer.valueOf(userId))
                            .onSuccess(success -> {
                                if (success) {
                                    logger.info("Successfully deleted user with ID: {}", userId);
                                    routingContext.response()
                                            .setStatusCode(200)
                                            .end("user deleted successfully");
                                } else {
                                    sendErrorResponse(routingContext, "Failed to delete user with ID: " + userId, "Failed to delete user with ID: " + userId);
                                }
                            })
                            .onFailure(err -> sendErrorResponse(routingContext, "Failed to delete user with ID: " + userId, err.getMessage()));
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to delete user with ID: " + userId, err.getMessage()));
    }

    private void handleUpdateUser(RoutingContext routingContext) {
        logger.info("Client made a request for path: {}", routingContext.currentRoute().getPath());
        User user = jsonManager.fromJson(routingContext.body().asString(), User.class);
        userService.update(user)
                .onSuccess(dbUser -> {
                    logger.info("Sending updated user {} back", user.getId());
                    routingContext.response()
                            .setStatusCode(200)
                            .end(jsonManager.toJson(dbUser));
                })
                .onFailure(err -> sendErrorResponse(routingContext, "Failed to update user with ID: " + user.getId(), err.getMessage()));
    }

}

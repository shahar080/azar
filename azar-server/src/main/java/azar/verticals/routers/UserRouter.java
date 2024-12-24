package azar.verticals.routers;

import azar.dal.service.UserService;
import azar.entities.LoginResponse;
import azar.entities.db.User;
import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.BaseRequest;
import azar.entities.requests.user.UserAddRequest;
import azar.entities.requests.user.UserLoginRequest;
import azar.entities.requests.user.UserUpdateRequest;
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

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class UserRouter extends BaseRouter {
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
        UserLoginRequest userLoginRequest = jsonManager.fromJson(routingContext.body().asString(), UserLoginRequest.class);
        String currentUser = userLoginRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        // Parse JSON body to UserNameAndPassword
        UserNameAndPassword userNameAndPassword = userLoginRequest.getUserNameAndPassword();

        if (userNameAndPassword == null) {
            sendBadRequestResponse(routingContext, "Missing username and password");
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
                        sendOKResponse(routingContext, jsonManager.toJson(response),
                                "User '%s' has logged in successfully.".formatted(user.getUserName()));
                    } else {
                        sendBadRequestResponse(routingContext, "Wrong username or password.");
                    }
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error while retrieving user by username: {}"));
    }

    private void handleAddUser(RoutingContext routingContext) {
        UserAddRequest userAddRequest = jsonManager.fromJson(routingContext.body().asString(), UserAddRequest.class);
        String currentUser = userAddRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        userService.getUserByUserName(userAddRequest.getCurrentUser())
                .onSuccess(dbUser -> {
                    if (dbUser == null) {
                        sendBadRequestResponse(routingContext, "Can't find user with the username %s".formatted(userAddRequest.getCurrentUser()));
                        return;
                    }
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(userAddRequest.getCurrentUser()));
                        return;
                    }
                    User user = userAddRequest.getUserToAdd();
                    // Validate user data
                    if (userService.isInvalidUser(user)) {
                        sendBadRequestResponse(routingContext, "User to add is missing values");
                        return;
                    }

                    // Check if username already exists
                    userService.getUserByUserName(user.getUserName())
                            .onSuccess(existingUser -> {
                                if (existingUser != null) {
                                    sendBadRequestResponse(routingContext, "Username '%s' already exists!".formatted(user.getUserName()));
                                } else {
                                    // Add user to the system
                                    addUser(routingContext, user);
                                }
                            })
                            .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error while handling add user: %s".formatted(user.getUserName())));
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error while handling add user: %s".formatted(userAddRequest.getUserToAdd().getUserName())));
    }

    private void addUser(RoutingContext routingContext, User user) {
        user.setPassword(passwordManager.hashPassword(user.getPassword()));
        userService.add(user)
                .onSuccess(addedUser -> sendCreatedResponse(routingContext, jsonManager.toJson(addedUser.getId(), Integer.class),
                        "User '%s' has registered successfully.".formatted(user.getUserName())))
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error while adding user: %s".formatted(user.getUserName())));
    }

    private void getAllUsers(RoutingContext routingContext) {
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

        userService.getAllClientPaginated(offset, limit) // Fetch paginated results
                .onSuccess(users -> sendOKResponse(routingContext, jsonManager.toJson(users),
                        "Returned %s users to client (page: %s, limit: %s)".formatted(users.size(), page, limit)))
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Error getting users from DB"));
    }

    private void handleDeleteUser(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String userId = routingContext.pathParam("id");
        if (userId == null || userId.isEmpty()) {
            sendBadRequestResponse(routingContext, "user ID is required");
            return;
        }

        userService.getById(Integer.valueOf(userId))
                .onSuccess(dbUser -> {

                    if (dbUser.getUserName().equalsIgnoreCase(currentUser)) {
                        sendBadRequestResponse(routingContext, "Current user can't delete itself");
                        return;
                    }

                    if (dbUser.getUserName().equalsIgnoreCase("admin")) {
                        sendUnauthorizedErrorResponse(routingContext, "User admin can't be deleted");
                        return;
                    }

                    userService.removeById(Integer.valueOf(userId))
                            .onSuccess(success -> {
                                if (success) {
                                    sendOKResponse(routingContext, "user deleted successfully",
                                            "Successfully deleted user with ID: %s".formatted(userId));
                                } else {
                                    sendInternalErrorResponse(routingContext, "Failed to delete user with ID: " + userId);
                                }
                            })
                            .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to delete user with ID: " + userId));
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to delete user with ID: " + userId));
    }

    private void handleUpdateUser(RoutingContext routingContext) {
        UserUpdateRequest userUpdateRequest = jsonManager.fromJson(routingContext.body().asString(), UserUpdateRequest.class);
        String currentUser = userUpdateRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        User user = userUpdateRequest.getUser();
        userService.update(user)
                .onSuccess(dbUser -> sendOKResponse(routingContext, jsonManager.toJson(dbUser),
                        "Sending updated user %s back".formatted(user.getId())))
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to update user with ID: " + user.getId()));
    }

}

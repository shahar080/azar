package azar.cloud.routers;

import azar.cloud.entities.db.UserNameAndPassword;
import azar.cloud.entities.requests.user.UserLoginRequest;
import azar.cloud.entities.requests.user.UserUpsertRequest;
import azar.cloud.entities.responses.LoginResponse;
import azar.cloud.utils.AuthService;
import azar.cloud.utils.PasswordManager;
import azar.shared.dal.service.UserService;
import azar.shared.entities.db.User;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;
import static azar.shared.utils.Utilities.isInteger;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class UserRouter extends BaseRouter {
    private final UserService userService;
    private final JsonManager jsonManager;
    private final PasswordManager passwordManager;

    @Inject
    public UserRouter(UserService userService, JsonManager jsonManager, PasswordManager passwordManager) {
        this.userService = userService;
        this.jsonManager = jsonManager;
        this.passwordManager = passwordManager;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router userRouter = Router.router(vertx);
        userRouter.route(OPS_PREFIX_STRING + "/*").handler(JWTAuthHandler.create(jwtAuth));

        userRouter.post("/login").handler(routingContext -> handleUserLogin(routingContext, jwtAuth));
        userRouter.post(OPS_PREFIX_STRING + "/getAll").handler(this::getAllUsers);
        userRouter.post(OPS_PREFIX_STRING + "/add").handler(this::handleAddUser);
        userRouter.post(OPS_PREFIX_STRING + "/update").handler(this::handleUpdateUser);
        userRouter.post(OPS_PREFIX_STRING + "/delete/:id").handler(this::handleDeleteUser);

        return userRouter;
    }

    private void handleUserLogin(RoutingContext routingContext, JWTAuth jwtAuth) {
        UserLoginRequest userLoginRequest = jsonManager.fromJson(routingContext.body().asString(), UserLoginRequest.class);
        String currentUser = userLoginRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

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

                        LoginResponse response = new LoginResponse(true, token, user.getUserName(), user.getUserType(), user.getId());
                        sendOKResponse(routingContext, jsonManager.toJson(response),
                                "User '%s' has logged in successfully.".formatted(user.getUserName()));
                    } else {
                        sendBadRequestResponse(routingContext, "Wrong username or password.");
                    }
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while retrieving user by username: %s, error: %s".formatted(userNameAndPassword.getUserName(), err.getMessage())));
    }

    private void handleAddUser(RoutingContext routingContext) {
        UserUpsertRequest userUpsertRequest = jsonManager.fromJson(routingContext.body().asString(), UserUpsertRequest.class);
        String currentUser = userUpsertRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        userService.isAdmin(userUpsertRequest.getCurrentUser())
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(userUpsertRequest.getCurrentUser()));
                        return;
                    }
                    User user = userUpsertRequest.getUser();

                    if (userService.isInvalidUser(user)) {
                        sendBadRequestResponse(routingContext, "User to add is missing values");
                        return;
                    }

                    userService.getUserByUserName(user.getUserName())
                            .onSuccess(existingUser -> {
                                if (existingUser != null) {
                                    sendBadRequestResponse(routingContext, "Username '%s' already exists!".formatted(user.getUserName()));
                                } else {
                                    user.setPassword(passwordManager.hashPassword(user.getPassword()));
                                    userService.add(user)
                                            .onSuccess(addedUser -> sendCreatedResponse(routingContext, jsonManager.toJson(addedUser.getId(), Integer.class),
                                                    "User '%s' has registered successfully.".formatted(user.getUserName())))
                                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while adding user: %s, error: %s".formatted(user.getUserName(), err.getMessage())));

                                }
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while handling add user: %s, error: %s".formatted(user.getUserName(), err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while handling add user: %s, error: %s".formatted(userUpsertRequest.getUser().getUserName(), err.getMessage())));
    }

    private void getAllUsers(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        int page = Integer.parseInt(routingContext.queryParams().get("page"));
        int limit = Integer.parseInt(routingContext.queryParams().get("limit"));

        if (page < 1 || limit < 1) {
            sendBadRequestResponse(routingContext, "Page and limit must be greater than 0.");
            return;
        }

        int offset = (page - 1) * limit;

        userService.getAllClientPaginated(offset, limit, "")
                .onSuccess(users -> sendOKResponse(routingContext, jsonManager.toJson(users),
                        "Returned %s users to client (page: %s, limit: %s)".formatted(users.size(), page, limit)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting users from DB, error: %s".formatted(err.getMessage())));
    }

    private void handleDeleteUser(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String userId = routingContext.pathParam("id");
        if (userId == null || userId.isEmpty() || !isInteger(userId)) {
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
                                    sendInternalErrorResponse(routingContext, "Failed to delete user with ID: %s".formatted(userId));
                                }
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to delete user with ID: %s, error: %s".formatted(userId, err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to delete user with ID: %s, error: %s".formatted(userId, err.getMessage())));
    }

    private void handleUpdateUser(RoutingContext routingContext) {
        UserUpsertRequest userUpdateRequest = jsonManager.fromJson(routingContext.body().asString(), UserUpsertRequest.class);
        String currentUser = userUpdateRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        User user = userUpdateRequest.getUser();
        userService.update(user)
                .onSuccess(dbUser -> sendOKResponse(routingContext, jsonManager.toJson(dbUser),
                        "Sending updated user %s back".formatted(user.getId())))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to update user with ID: %s, error: %s ".formatted(user.getId(), err.getMessage())));
    }

}

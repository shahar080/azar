package azar.cloud.resources;

import azar.cloud.entities.db.UserNameAndPassword;
import azar.cloud.entities.requests.user.UserLoginRequest;
import azar.cloud.entities.requests.user.UserUpsertRequest;
import azar.cloud.entities.responses.LoginResponse;
import azar.cloud.utils.AuthService;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import azar.cloud.utils.PasswordManager;
import azar.shared.dal.service.UserService;
import azar.shared.entities.db.User;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.resources.BaseResource;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
@Path("/api/c/user")
public class UserResource extends BaseResource {
    @Inject
    SecurityIdentity identity;

    private final UserService userService;
    private final AuthService authService;
    private final PasswordManager passwordManager;

    public UserResource(UserService userService, AuthService authService, PasswordManager passwordManager) {
        this.userService = userService;
        this.authService = authService;
        this.passwordManager = passwordManager;
    }

    @Path("/login")
    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @Transactional
    public Response userLogin(UserLoginRequest userLoginRequest) {
        UserNameAndPassword userNameAndPassword = userLoginRequest.getUserNameAndPassword();

        if (userNameAndPassword == null) {
            return badRequest("Missing username and password");
        }
        User user = userService.getUserByUserName(userNameAndPassword.getUserName());
        if (passwordManager.checkPassword(userNameAndPassword.getPassword(), user.getPassword())) {
            LoginResponse response = new LoginResponse(true, authService.getAuthToken(user), user.getUserName(), user.getUserType(), user.getId());
            return ok(response);
        }
        return unauthorized("Wrong username or password");
    }

    @Path(ADMIN_PREFIX_STRING + "/add")
    @POST
    @Transactional
    public Response addUser(UserUpsertRequest userUpsertRequest) {
        User userToAdd = userUpsertRequest.getUser();
        userToAdd.setPassword(passwordManager.hashPassword(userToAdd.getPassword()));
        return created(userService.merge(userUpsertRequest.getUser()), "User with userName %s added".formatted(userUpsertRequest.getUser().getUserName()));
    }

    @Path(ADMIN_PREFIX_STRING + "/getAll")
    @POST
    @Transactional
    public Response getAllUsers(@QueryParam("page") int page, @QueryParam("limit") int limit, BaseRequest baseRequest) {
        if (page < 1 || limit < 1) {
            return badRequest("Page and limit must be greater than 0.");
        }

        int offset = (page - 1) * limit;

        return ok(userService.getAllClientPaginated(offset, limit));
    }

    @Path(ADMIN_PREFIX_STRING + "/update")
    @POST
    @Transactional
    public Response updateUser(UserUpsertRequest userUpdateRequest) {
        User requestUser = userUpdateRequest.getUser();
        User dbUser = userService.getById(userUpdateRequest.getUser().getId());
        dbUser.setFirstName(requestUser.getFirstName());
        dbUser.setLastName(requestUser.getLastName());
        dbUser.setUserType(requestUser.getUserType());
        return ok(dbUser);
    }

    @Path(ADMIN_PREFIX_STRING + "/delete/{id}")
    @POST
    @Transactional
    public Response deleteUser(@PathParam("id") int userId, BaseRequest baseRequest) {
        User dbUser = userService.getById(userId);

        if (dbUser.getUserName().equalsIgnoreCase(identity.getPrincipal().getName())) {
            return badRequest("Current user can't delete itself");
        }

        if (dbUser.getUserName().equalsIgnoreCase("admin")) {
            return unauthorized("User admin can't be deleted");
        }

        if (userService.removeById(userId)) {
            return ok("user deleted successfully");
        }
        return internalError("Failed to delete user with ID: %s".formatted(userId));
    }

}

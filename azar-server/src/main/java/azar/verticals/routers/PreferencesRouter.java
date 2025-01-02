package azar.verticals.routers;

import azar.dal.service.PreferencesService;
import azar.dal.service.UserService;
import azar.entities.db.Preference;
import azar.entities.requests.BaseRequest;
import azar.entities.requests.preferences.PreferenceUpsertRequest;
import azar.entities.requests.preferences.PreferencesGetAllRequest;
import azar.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
public class PreferencesRouter extends BaseRouter {
    private final PreferencesService preferencesService;
    private final UserService userService;
    private final JsonManager jsonManager;

    @Inject
    public PreferencesRouter(PreferencesService preferencesService, UserService userService, JsonManager jsonManager) {
        this.preferencesService = preferencesService;
        this.userService = userService;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx) {
        Router preferencesRouter = Router.router(vertx);

        preferencesRouter.post("/add").handler(this::handleAddPreference);
        preferencesRouter.post("/update").handler(this::handleUpdatePreference);
        preferencesRouter.post("/delete/:id").handler(this::handleDeletePreference);
        preferencesRouter.post("/getAll").handler(this::handleGetAllPreferences);

        return preferencesRouter;
    }

    private void handleAddPreference(RoutingContext routingContext) {
        PreferenceUpsertRequest preferenceUpsertRequest = jsonManager.fromJson(routingContext.body().asString(), PreferenceUpsertRequest.class);
        String currentUser = preferenceUpsertRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        Preference preferenceToAdd = preferenceUpsertRequest.getPreference();
        userService.getUserByUserName(currentUser)
                .onSuccess(dbUser -> {
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add preferences!".formatted(currentUser));
                        return;
                    }

                    preferencesService.add(preferenceToAdd)
                            .onSuccess(_ -> {
                                sendCreatedResponse(routingContext, "Successfully added preference", "Preference %s was added with value %s".formatted(preferenceToAdd.getKey(), preferenceToAdd.getValue()));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error adding preference, error: %s".formatted(err.getMessage())));
                });
    }

    private void handleUpdatePreference(RoutingContext routingContext) {
        PreferenceUpsertRequest preferenceUpsertRequest = jsonManager.fromJson(routingContext.body().asString(), PreferenceUpsertRequest.class);
        String currentUser = preferenceUpsertRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        Preference preferenceToUpdate = preferenceUpsertRequest.getPreference();
        userService.getUserByUserName(currentUser)
                .onSuccess(dbUser -> {
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add preferences!".formatted(currentUser));
                        return;
                    }

                    preferencesService.update(preferenceToUpdate)
                            .onSuccess(_ -> {
                                sendOKResponse(routingContext, "Successfully updated preference", "Preference %s was updated with value %s".formatted(preferenceToUpdate.getKey(), preferenceToUpdate.getValue()));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error updating preference, error: %s".formatted(err.getMessage())));
                });
    }

    private void handleDeletePreference(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String preferenceId = routingContext.pathParam("id");
        if (preferenceId == null || preferenceId.isEmpty()) {
            sendBadRequestResponse(routingContext, "Preference ID is required");
            return;
        }

        userService.getUserByUserName(currentUser)
                .onSuccess(dbUser -> {
                    if (!dbUser.isAdmin()) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to delete preferences!".formatted(currentUser));
                        return;
                    }

                    preferencesService.removeById(Integer.valueOf(preferenceId))
                            .onSuccess(_ -> {
                                sendOKResponse(routingContext, "Successfully deleted preference", "Preference with id %s was deleted".formatted(preferenceId));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error deleting preference, error: %s".formatted(err.getMessage())));
                });
    }

    private void handleGetAllPreferences(RoutingContext routingContext) {
        PreferencesGetAllRequest preferencesGetAllRequest = jsonManager.fromJson(routingContext.body().asString(), PreferencesGetAllRequest.class);
        String currentUser = preferencesGetAllRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        // Default values for pagination
        int page = Integer.parseInt(routingContext.queryParams().get("page"));
        int limit = Integer.parseInt(routingContext.queryParams().get("limit"));

        if (page < 1 || limit < 1) {
            sendBadRequestResponse(routingContext, "Page and limit must be greater than 0.");
            return;
        }

        int offset = (page - 1) * limit;

        preferencesService.getAllClientPaginated(offset, limit, "where s.userId = \"%s\"".formatted(preferencesGetAllRequest.getUserId())) // Fetch paginated results
                .onSuccess(preferences -> sendOKResponse(routingContext, jsonManager.toJson(preferences),
                        "Returned %s preferences to client (page: %s, limit: %s)".formatted(preferences.size(), page, limit)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting preferences from DB, error: %s".formatted(err.getMessage())));
    }

}

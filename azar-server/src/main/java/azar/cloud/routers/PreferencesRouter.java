package azar.cloud.routers;

import azar.cloud.dal.service.PreferencesService;
import azar.cloud.entities.db.Preference;
import azar.cloud.entities.requests.preferences.PreferenceUpsertRequest;
import azar.cloud.entities.requests.preferences.PreferencesGetAllRequest;
import azar.shared.dal.service.UserService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
public class PreferencesRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final PreferencesService preferencesService;
    private final UserService userService;
    private final JsonManager jsonManager;

    @Inject
    public PreferencesRouter(PreferencesService preferencesService, UserService userService, JsonManager jsonManager) {
        this.preferencesService = preferencesService;
        this.userService = userService;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router preferencesRouter = Router.router(vertx);
        preferencesRouter.route(OPS_PREFIX_STRING + "/*").handler(JWTAuthHandler.create(jwtAuth));

        preferencesRouter.post("/add").handler(this::handleAddPreference);
        preferencesRouter.post("/update").handler(this::handleUpdatePreference);
        preferencesRouter.post("/getAll").handler(this::handleGetAllPreferences);

        return preferencesRouter;
    }

    private void handleAddPreference(RoutingContext routingContext) {
        PreferenceUpsertRequest preferenceUpsertRequest = jsonManager.fromJson(routingContext.body().asString(), PreferenceUpsertRequest.class);
        String currentUser = preferenceUpsertRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        Preference preferenceToAdd = preferenceUpsertRequest.getPreference();
        userService.isAdmin(currentUser)
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add preferences!".formatted(currentUser));
                        return;
                    }
                    logger.warn("Adding preference {} for user {} as new preference since it doesn't exist in DB", preferenceToAdd.getKey(), preferenceToAdd.getUserId());
                    preferencesService.add(preferenceToAdd)
                            .onSuccess(_ -> sendCreatedResponse(routingContext, "Successfully added preference", "Preference %s was added with value %s".formatted(preferenceToAdd.getKey(), preferenceToAdd.getValue())))
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error adding preference, error: %s".formatted(err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error adding preference, error: %s".formatted(err.getMessage())));
    }

    private void handleUpdatePreference(RoutingContext routingContext) {
        PreferenceUpsertRequest preferenceUpsertRequest = jsonManager.fromJson(routingContext.body().asString(), PreferenceUpsertRequest.class);
        String currentUser = preferenceUpsertRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        Preference preferenceToUpdate = preferenceUpsertRequest.getPreference();
        preferencesService.getByKey(preferenceToUpdate.getKey(), preferenceToUpdate.getUserId())
                .onSuccess(dbPreference -> {
                    if (dbPreference != null) {
                        dbPreference.setValue(preferenceToUpdate.getValue());
                        preferencesService.update(dbPreference)
                                .onSuccess(preference -> sendOKResponse(routingContext, jsonManager.toJson(preference), "Preference %s was updated with value %s".formatted(preferenceToUpdate.getKey(), preferenceToUpdate.getValue())))
                                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error updating preference, error: %s".formatted(err.getMessage())));
                        return;
                    }

                    preferencesService.add(preferenceToUpdate)
                            .onSuccess(preference -> sendOKResponse(routingContext, jsonManager.toJson(preference), "Preference %s was updated with value %s".formatted(preferenceToUpdate.getKey(), preferenceToUpdate.getValue())))
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error updating preference, error: %s".formatted(err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error updating preference, error: %s".formatted(err.getMessage())));
    }

    private void handleGetAllPreferences(RoutingContext routingContext) {
        PreferencesGetAllRequest preferencesGetAllRequest = jsonManager.fromJson(routingContext.body().asString(), PreferencesGetAllRequest.class);
        String currentUser = preferencesGetAllRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        preferencesService.getAllUsers(preferencesGetAllRequest.getUserId())
                .onSuccess(preferences -> sendOKResponse(routingContext, jsonManager.toJson(preferences),
                        "Returned %s preferences to client".formatted(preferences.size())))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting preferences from DB, error: %s".formatted(err.getMessage())));
    }

}

package azar.cloud.resources;

import azar.cloud.dal.service.PreferencesService;
import azar.cloud.entities.db.Preference;
import azar.cloud.entities.requests.preferences.PreferenceUpsertRequest;
import azar.cloud.entities.requests.preferences.PreferencesGetAllRequest;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import azar.shared.resources.BaseResource;
import io.quarkus.security.Authenticated;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Path("/api/c" + ADMIN_PREFIX_STRING + "/preference")
public class PreferencesResource extends BaseResource {

    private final PreferencesService preferencesService;

    public PreferencesResource(PreferencesService preferencesService) {
        this.preferencesService = preferencesService;
    }

    @Path("/update")
    @POST
    @Transactional
    @Authenticated
    public Response updatePreference(PreferenceUpsertRequest preferenceUpsertRequest) {
        Preference preferenceToUpdate = preferenceUpsertRequest.getPreference();
        Preference dbPreference = preferencesService.getByKey(preferenceToUpdate.getKey(), preferenceUpsertRequest.getUserId());

        if (dbPreference != null) {
            dbPreference.setValue(preferenceToUpdate.getValue());
            Preference savedPreference = preferencesService.merge(dbPreference);
            if (savedPreference != null) {
                return ok(dbPreference, "Preference %s was updated with value %s".formatted(preferenceToUpdate.getKey(), preferenceToUpdate.getValue()));
            }
        }
        return internalError("Error updating preference");
    }

    @Path("/getAll")
    @POST
    @Transactional
    @Authenticated
    public Response getAllPreferences(PreferencesGetAllRequest preferencesGetAllRequest) {
        return ok(preferencesService.getAllUsers(preferencesGetAllRequest.getUserId()));
    }

}

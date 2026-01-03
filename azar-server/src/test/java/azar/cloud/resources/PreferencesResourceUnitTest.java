package azar.cloud.resources;

import java.util.Set;
import azar.cloud.dal.service.PreferencesService;
import azar.cloud.entities.db.Preference;
import azar.cloud.entities.requests.preferences.PreferenceUpsertRequest;
import azar.cloud.entities.requests.preferences.PreferencesGetAllRequest;
import azar.shared.entities.db.User;
import azar.testinfra.BaseUnitTest;
import azar.testinfra.ResourceTestUtil;
import jakarta.ws.rs.core.Response;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PreferencesResourceUnitTest extends BaseUnitTest {

    @Mock
    PreferencesService preferencesService;

    @InjectMocks
    PreferencesResource resource;

    @BeforeEach
    void setUp() {
        ResourceTestUtil.injectMockRoutingContext(resource, "/api/c/admin/preference");
    }

    private Preference pref(String key, String value) {
        Preference p = Preference.builder().key(key).value(value).build();
        // User is ignored in JSON via @JsonIgnore, but not needed for unit tests
        p.setUser(new User());
        return p;
    }

    @Test
    void updatePreference_whenFoundAndMerged_returns200WithUpdatedEntity() {
        Preference incoming = pref("DARK_MODE", "true");
        Preference db = pref("DARK_MODE", "false");
        when(preferencesService.getByKey("DARK_MODE", 7)).thenReturn(db);
        when(preferencesService.merge(db)).thenReturn(db);

        PreferenceUpsertRequest req = new PreferenceUpsertRequest(incoming, 7);
        Response r = resource.updatePreference(req);

        assertThat(r.getStatus()).isEqualTo(200);
        Preference returned = (Preference) r.getEntity();
        assertThat(returned.getValue()).isEqualTo("true");
        verify(preferencesService).merge(db);
    }

    @Test
    void updatePreference_whenNotFound_returns500() {
        Preference incoming = pref("DRAWER_PINNED", "false");
        when(preferencesService.getByKey("DRAWER_PINNED", 5)).thenReturn(null);

        PreferenceUpsertRequest req = new PreferenceUpsertRequest(incoming, 5);
        Response r = resource.updatePreference(req);
        assertThat(r.getStatus()).isEqualTo(500);
        verify(preferencesService, never()).merge(any());
    }

    @Test
    void updatePreference_whenMergeReturnsNull_returns500() {
        Preference incoming = pref("DRAWER_PINNED", "true");
        Preference db = pref("DRAWER_PINNED", "false");
        when(preferencesService.getByKey("DRAWER_PINNED", 9)).thenReturn(db);
        when(preferencesService.merge(db)).thenReturn(null);

        PreferenceUpsertRequest req = new PreferenceUpsertRequest(incoming, 9);
        Response r = resource.updatePreference(req);
        assertThat(r.getStatus()).isEqualTo(500);
    }

    @Test
    void getAllPreferences_returnsOkWithSet() {
        Set<Preference> prefs = Set.of(pref("A", "1"), pref("B", "2"));
        when(preferencesService.getAllUsers(3)).thenReturn(prefs);

        PreferencesGetAllRequest req = new PreferencesGetAllRequest(3);
        Response r = resource.getAllPreferences(req);

        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isEqualTo(prefs);
        verify(preferencesService).getAllUsers(3);
    }
}

package azar.whoami.resources;

import java.util.Base64;
import java.util.List;
import azar.testinfra.GsonTestUtil;
import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import azar.whoami.entities.requests.UpdateWhoAmIDataRequest;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * HTTP tests that explicitly use the Gson JAX-RS provider by setting
 * Content-Type/Accept to application/gson+json.
 */
@QuarkusTest
class WhoAmIResourceGsonHttpTest {

    private static final String GSON_MEDIA = "application/gson+json";

    @InjectMock
    WhoAmIService whoAmIService;

    @Test
    @TestSecurity(user = "anyone", roles = {"USER"})
    void getWhoAmI_withGsonAccept_returns200_andPayload() {
        WhoAmIData d = new WhoAmIData();
        d.setHeaderTitle("GsonTitle");
        when(whoAmIService.getFirst()).thenReturn(d);

        given()
                .accept(GSON_MEDIA)
                .when()
                .get("/api/wai/whoami/get")
                .then()
                .statusCode(200)
                .contentType(GSON_MEDIA)
                .body("headerTitle", equalTo("GsonTitle"));
    }

    @Test
    @TestSecurity(user = "admin", roles = {"Admin"})
    void updateWhoAmI_withGsonContentType_returns200() {
        when(whoAmIService.getFirst()).thenReturn(null);
        when(whoAmIService.merge(any())).thenAnswer(inv -> inv.getArgument(0));

        WhoAmIData client = new WhoAmIData();
        client.setHeaderTitle("T");
        client.setPhotos(List.of(Base64.getEncoder().encodeToString("x".getBytes())));
        String body = GsonTestUtil.toJson(new UpdateWhoAmIDataRequest(client));

        given()
                .contentType(GSON_MEDIA)
                .accept(GSON_MEDIA)
                .body(body)
                .when()
                .post("/api/wai/whoami/admin/update")
                .then()
                .statusCode(200)
                .contentType(GSON_MEDIA)
                .body(equalTo("Successfully updated WhoAmI data"));
    }

    @Test
    @TestSecurity(user = "admin", roles = {"Admin"})
    void updateWhoAmI_withInvalidBase64_viaGson_returns400() {
        when(whoAmIService.getFirst()).thenReturn(null);

        WhoAmIData client = new WhoAmIData();
        client.setHeaderTitle("BadPhotos");
        client.setPhotos(List.of("NOT_BASE64"));
        String body = GsonTestUtil.toJson(new UpdateWhoAmIDataRequest(client));

        given()
                .contentType(GSON_MEDIA)
                .accept(GSON_MEDIA)
                .body(body)
                .when()
                .post("/api/wai/whoami/admin/update")
                .then()
                .statusCode(400)
                .contentType(GSON_MEDIA)
                .body(notNullValue());
    }
}

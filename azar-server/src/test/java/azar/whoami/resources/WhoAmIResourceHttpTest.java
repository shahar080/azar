package azar.whoami.resources;

import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;
import static org.hamcrest.Matchers.equalTo;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;

@QuarkusTest
class WhoAmIResourceHttpTest {

    @InjectMock
    WhoAmIService whoAmIService;

    @Test
    @TestSecurity(user = "anyone", roles = {"USER"})
    void getWhoAmI_http200_andPayload() {
        WhoAmIData d = new WhoAmIData();
        d.setHeaderTitle("Title");
        when(whoAmIService.getFirst()).thenReturn(d);

        given()
                .when().get("/api/wai/whoami/get")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("headerTitle", equalTo("Title"));
    }

    @Test
    @TestSecurity(user = "admin", roles = {"Admin"})
    void updateWhoAmI_adminOnly_http200() {
        when(whoAmIService.getFirst()).thenReturn(null);
        when(whoAmIService.merge(org.mockito.ArgumentMatchers.any())).thenAnswer(inv -> inv.getArgument(0));

        String json = "{" +
                "\"whoAmIData\": {" +
                "\"headerTitle\": \"T\", " +
                "\"photos\": [\"" + java.util.Base64.getEncoder().encodeToString("x".getBytes()) + "\"]" +
                "}" +
                "}";

        given()
                .contentType(ContentType.JSON)
                .body(json)
                .when()
                .post("/api/wai/whoami/admin/update")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body(equalTo("Successfully updated WhoAmI data"));
    }

    @Test
    @TestSecurity(user = "user", roles = {"USER"})
    void updateWhoAmI_forbidden_forNonAdmin() {
        String json = "{\"whoAmIData\": {}}";
        given()
                .contentType(ContentType.JSON)
                .body(json)
                .when()
                .post("/api/wai/whoami/admin/update")
                .then()
                .statusCode(403);
    }
}

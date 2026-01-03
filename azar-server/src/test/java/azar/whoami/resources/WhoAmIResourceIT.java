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

/**
 * Converted to an offline-friendly HTTP test that does not require a database.
 * Mocks the WhoAmIService and verifies the HTTP contract.
 */
@QuarkusTest
class WhoAmIResourceIT {

    @InjectMock
    WhoAmIService whoAmIService;

    @Test
    @TestSecurity(user = "anyone", roles = {"USER"})
    void getWhoAmI_http200_andPayload_withoutDb() {
        WhoAmIData d = new WhoAmIData();
        d.setHeaderTitle("OfflineIT");
        when(whoAmIService.getFirst()).thenReturn(d);

        given()
                .when().get("/api/wai/whoami/get")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("headerTitle", equalTo("OfflineIT"));
    }
}

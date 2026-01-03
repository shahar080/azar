package azar.gallery.resources;

import java.util.List;
import azar.gallery.dal.service.PhotoService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;

@QuarkusTest
class PhotoResourceHttpTest {

    @InjectMock
    PhotoService photoService;

    @Test
    @TestSecurity(user = "any", roles = {"USER"})
    void getIds_http200_andArray() {
        when(photoService.getPhotosId()).thenReturn(List.of(1, 2, 3));

        given()
                .when().get("/api/g/photo/getIds")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", is(3))
                .body("[0]", is(1))
                .body("[1]", is(2))
                .body("[2]", is(3));
    }

    @Test
    @TestSecurity(user = "admin", roles = {"Admin"})
    void delete_adminOnly_http200() {
        when(photoService.removeById(42)).thenReturn(true);

        given()
                .contentType(ContentType.JSON)
                .body("{}")
                .when()
                .post("/api/g/photo/admin/delete/42")
                .then()
                .statusCode(200)
                .body(equalTo("photo deleted successfully"));
    }

    @Test
    @TestSecurity(user = "user", roles = {"USER"})
    void delete_forbidden_forNonAdmin() {
        given()
                .contentType(ContentType.JSON)
                .body("{}")
                .when()
                .post("/api/g/photo/admin/delete/42")
                .then()
                .statusCode(403);
    }
}

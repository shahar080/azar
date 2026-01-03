package azar.cloud.resources;

import azar.cloud.dal.service.PdfFileService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.security.TestSecurity;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;

@QuarkusTest
class PdfResourceHttpTest {

    @InjectMock
    PdfFileService pdfFileService;

    @Test
    @TestSecurity(user = "admin", roles = {"Admin"})
    void deletePdf_adminAllowed_http200() {
        int id = 77;
        when(pdfFileService.getOwnerByPdfId(id)).thenReturn("someone");
        when(pdfFileService.removeById(id)).thenReturn(true);

        String body = "{\n  \"userName\": \"another\"\n}";

        given()
                .contentType(ContentType.JSON)
                .body(body)
                .when()
                .post("/api/c/admin/pdf/delete/" + id)
                .then()
                .statusCode(200);
    }

    @Test
    @TestSecurity(user = "user", roles = {"User"})
    void deletePdf_notOwnerAndNotAdmin_unauthorized401() {
        int id = 78;
        when(pdfFileService.getOwnerByPdfId(id)).thenReturn("alice");

        String body = "{\n  \"userName\": \"charlie\"\n}";

        given()
                .contentType(ContentType.JSON)
                .body(body)
                .when()
                .post("/api/c/admin/pdf/delete/" + id)
                .then()
                .statusCode(401);
    }
}

package azar.cloud.resources;

import java.lang.reflect.Field;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import azar.cloud.dal.service.PdfFileService;
import azar.cloud.entities.db.PdfFile;
import azar.cloud.entities.requests.pdf.PdfDeleteRequest;
import azar.shared.cache.CacheManager;
import azar.shared.entities.requests.BaseRequest;
import azar.testinfra.BaseUnitTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.ws.rs.core.Response;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PdfResourceUnitTest extends BaseUnitTest {

    @Mock
    PdfFileService pdfFileService;
    @Mock
    CacheManager cacheManager;
    @Mock
    ObjectMapper objectMapper;

    @InjectMocks
    PdfResource resource;

    @BeforeEach
    void setupCtx() {
        azar.testinfra.ResourceTestUtil.injectMockRoutingContext(resource, "/api/c/admin/pdf");
    }

    private void setIdentityRoles(String... roles) {
        try {
            Field f = PdfResource.class.getDeclaredField("identity");
            f.setAccessible(true);
            SecurityIdentity identity = mock(SecurityIdentity.class);
            when(identity.getRoles()).thenReturn(Set.of(roles));
            f.set(resource, identity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void getAllPdfs_withInvalidParams_returnsBadRequest() {
        Response r = resource.getAllPdfs(0, 10, new BaseRequest());
        assertThat(r.getStatus()).isEqualTo(400);

        r = resource.getAllPdfs(1, 0, new BaseRequest());
        assertThat(r.getStatus()).isEqualTo(400);
    }

    @Test
    void getAllPdfs_validParams_returnsOkWithList() {
        when(pdfFileService.getAllClientPaginated(1, 5)).thenReturn(List.of(new PdfFile(), new PdfFile()));

        Response r = resource.getAllPdfs(1, 5, new BaseRequest());
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isInstanceOf(List.class);
        verify(pdfFileService).getAllClientPaginated(1, 5);
    }

    @Test
    void deletePdf_ownerDeletes_returnsOk() {
        int id = 42;
        PdfDeleteRequest req = new PdfDeleteRequest("alice");
        when(pdfFileService.getOwnerByPdfId(id)).thenReturn("alice");
        when(pdfFileService.removeById(id)).thenReturn(true);

        Response r = resource.deletePdfById(id, req);
        assertThat(r.getStatus()).isEqualTo(200);
        verify(pdfFileService).removeById(id);
    }

    @Test
    void deletePdf_adminDeletesOtherUsersPdf_returnsOk() {
        int id = 43;
        PdfDeleteRequest req = new PdfDeleteRequest("bob");
        when(pdfFileService.getOwnerByPdfId(id)).thenReturn("alice");
        when(pdfFileService.removeById(id)).thenReturn(true);
        setIdentityRoles("Admin");

        Response r = resource.deletePdfById(id, req);
        assertThat(r.getStatus()).isEqualTo(200);
        verify(pdfFileService).removeById(id);
    }

    @Test
    void deletePdf_nonOwnerAndNotAdmin_returnsUnauthorized() {
        int id = 44;
        PdfDeleteRequest req = new PdfDeleteRequest("charlie");
        when(pdfFileService.getOwnerByPdfId(id)).thenReturn("alice");
        setIdentityRoles("User");

        Response r = resource.deletePdfById(id, req);
        assertThat(r.getStatus()).isEqualTo(401);
        verify(pdfFileService, never()).removeById(anyInt());
    }

    @Test
    void getPdfById_whenNotFound_returns404() {
        when(pdfFileService.getById(99)).thenReturn(null);
        Response r = resource.getPdfById(99, new BaseRequest());
        assertThat(r.getStatus()).isEqualTo(404);
    }

    @Test
    void getThumbnailById_cacheHit_usesBase64CacheAndReturnsImage() throws Exception {
        int id = 55;
        byte[] thumb = new byte[]{1, 2, 3, 4};
        String b64 = Base64.getEncoder().encodeToString(thumb);
        when(cacheManager.get(azar.shared.cache.CacheKeys.PDF_THUMBNAIL.formatted(id))).thenReturn(b64);

        Response r = resource.getThumbnailById(id, new BaseRequest());
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat((byte[]) r.getEntity()).containsExactly(thumb);
    }
}

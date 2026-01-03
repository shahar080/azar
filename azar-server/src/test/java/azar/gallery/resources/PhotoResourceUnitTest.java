package azar.gallery.resources;

import java.util.List;
import azar.gallery.dal.service.PhotoService;
import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.gallery.entities.requests.photo.PhotoUpdateRequest;
import azar.gallery.managers.GeocodeManager;
import azar.gallery.metadata.PhotoMetadataExtractor;
import azar.testinfra.BaseUnitTest;
import azar.testinfra.ResourceTestUtil;
import jakarta.ws.rs.core.Response;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PhotoResourceUnitTest extends BaseUnitTest {

    private static GpsMetadata createGps(Double lat, Double lon, Double alt) {
        GpsMetadata g = new GpsMetadata();
        g.setLatitude(lat);
        g.setLongitude(lon);
        g.setAltitude(alt);
        return g;
    }

    @Mock
    PhotoService photoService;
    @Mock
    PhotoMetadataExtractor photoMetadataExtractor;
    @Mock
    GeocodeManager geocodeManager;

    @InjectMocks
    PhotoResource resource;

    @BeforeEach
    void setUp() {
        ResourceTestUtil.injectMockRoutingContext(resource, "/api/g/photo");
    }

    @Test
    void getIds_returnsOkWithList() {
        when(photoService.getPhotosId()).thenReturn(List.of(1, 2, 3));

        Response r = resource.getIds();
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isInstanceOf(List.class);
        assertThat((List<Integer>) r.getEntity()).containsExactly(1, 2, 3);
        verify(photoService).getPhotosId();
    }

    @Test
    void getLightweight_delegatesToService() {
        Photo p = Photo.builder().id(5).name("n").build();
        when(photoService.getLightWeightById(5)).thenReturn(p);
        Response r = resource.getLightweight(5);
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isEqualTo(p);
        verify(photoService).getLightWeightById(5);
    }

    @Test
    void getWithThumbnail_delegatesToService() {
        Photo p = Photo.builder().id(6).name("n").thumbnail(new byte[]{1}).build();
        when(photoService.getWithThumbnailById(6)).thenReturn(p);
        Response r = resource.getWithThumbnail(6);
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isEqualTo(p);
        verify(photoService).getWithThumbnailById(6);
    }

    @Test
    void getWithPhoto_delegatesToService() {
        Photo p = Photo.builder().id(7).name("n").data(new byte[]{1, 2}).build();
        when(photoService.getWithPhotoById(7)).thenReturn(p);
        Response r = resource.getWithPhoto(7);
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isEqualTo(p);
        verify(photoService).getWithPhotoById(7);
    }

    @Test
    void refreshMetadata_callsServiceAndReturnsOk() {
        Response r = resource.refreshMetadata(9, new azar.shared.entities.requests.BaseRequest());
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat((String) r.getEntity()).contains("metadata");
        verify(photoService).refreshMetadata(9);
    }

    @Test
    void deletePhoto_whenDaoReturnsTrue_returnsOk() {
        when(photoService.removeById(10)).thenReturn(true);
        Response r = resource.deletePhoto(10, new azar.shared.entities.requests.BaseRequest());
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat((String) r.getEntity()).contains("deleted successfully");
    }

    @Test
    void deletePhoto_whenDaoReturnsFalse_returns500() {
        when(photoService.removeById(11)).thenReturn(false);
        Response r = resource.deletePhoto(11, new azar.shared.entities.requests.BaseRequest());
        assertThat(r.getStatus()).isEqualTo(500);
    }

    @Test
    void updatePhoto_success_returnsOkWithEntity() {
        Photo incoming = Photo.builder()
                .id(12)
                .name("new")
                .description("d")
                .photoMetadata(PhotoMetadata.builder().gps(createGps(1.0, 2.0, 3.0)).build())
                .build();
        when(photoService.editPhotoPartial(any())).thenReturn(true);
        PhotoUpdateRequest req = new PhotoUpdateRequest(incoming);
        Response r = resource.updatePhoto(req);
        assertThat(r.getStatus()).isEqualTo(200);
        assertThat(r.getEntity()).isInstanceOf(Photo.class);
        Photo returned = (Photo) r.getEntity();
        assertThat(returned.getId()).isEqualTo(12);
        verify(photoService).editPhotoPartial(any());
    }

    @Test
    void updatePhoto_failure_returns500() {
        Photo incoming = Photo.builder().id(13).build();
        when(photoService.editPhotoPartial(any())).thenReturn(false);
        PhotoUpdateRequest req = new PhotoUpdateRequest(incoming);
        Response r = resource.updatePhoto(req);
        assertThat(r.getStatus()).isEqualTo(500);
    }
}

package azar.gallery.resources;

import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import azar.gallery.dal.service.PhotoService;
import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.gallery.entities.external.mapbox.api.LatLong;
import azar.gallery.entities.external.mapbox.api.MBData;
import azar.gallery.entities.external.mapbox.api.MBProperties;
import azar.gallery.entities.requests.photo.PhotoReverseGeocodeRequest;
import azar.gallery.entities.requests.photo.PhotoUpdateRequest;
import azar.gallery.entities.responses.ReverseGeocodeData;
import azar.gallery.managers.GeocodeManager;
import azar.gallery.metadata.PhotoMetadataExtractor;
import azar.gallery.utils.Utilities;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.resources.BaseResource;
import static azar.shared.utils.Utilities.getHumanReadableSize;
import io.smallrye.common.annotation.Blocking;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@Path("/api/g/photo")
public class PhotoResource extends BaseResource {
    private final PhotoService photoService;
    private final PhotoMetadataExtractor photoMetadataExtractor;
    private final GeocodeManager geocodeManager;

    public PhotoResource(PhotoService photoService, PhotoMetadataExtractor photoMetadataExtractor,
                         GeocodeManager geocodeManager) {
        this.photoService = photoService;
        this.photoMetadataExtractor = photoMetadataExtractor;
        this.geocodeManager = geocodeManager;
    }

    @Path(ADMIN_PREFIX_STRING + "/upload")
    @Blocking
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response uploadPhoto(@org.jboss.resteasy.reactive.RestForm("file")
                                org.jboss.resteasy.reactive.multipart.FileUpload file) {

        byte[] photoBytes;
        try {
            photoBytes = Files.readAllBytes(file.filePath());
        } catch (Exception e) {
            return internalError("Failed to read uploaded file: %s".formatted(e.getMessage()));
        }
        PhotoMetadata photoMetadata = photoMetadataExtractor.extractMetadataFromBytes(photoBytes);
        byte[] thumbnailBytes = Utilities.generateThumbnail(photoBytes, 100, 200);
        Photo photo = Photo.builder()
                .data(photoBytes)
                .description("")
                .name(file.fileName())
                .photoMetadata(photoMetadata)
                .thumbnail(thumbnailBytes)
                .size(getHumanReadableSize(photoBytes))
                .build();

        Photo savedPhoto = photoService.merge(photo);

        Photo response = savedPhoto.toBuilder().build();
        photoService.detach(response);
        response.setData(new byte[0]);
        response.setThumbnail(new byte[0]);

        return created(response, "Sending photo back to client");
    }

    @Path("/getLightweight/{id}")
    @POST
    @Transactional
    @PermitAll
    public Response getLightweight(@PathParam("id") int photoId) {
        return ok(photoService.getLightWeightById(photoId));
    }

    @Path("/getWithThumbnail/{id}")
    @POST
    @Transactional
    @PermitAll
    public Response getWithThumbnail(@PathParam("id") int photoId) {
        return ok(photoService.getWithThumbnailById(photoId));
    }

    @Path("/getWithPhoto/{id}")
    @POST
    @Transactional
    @PermitAll
    public Response getWithPhoto(@PathParam("id") int photoId) {
        return ok(photoService.getWithPhotoById(photoId));
    }

    @Path("/getIds")
    @GET
    @Transactional(Transactional.TxType.SUPPORTS)
    @PermitAll
    public Response getIds() {
        return ok(photoService.getPhotosId());
    }


    @Path(ADMIN_PREFIX_STRING + "/refreshMetadata/{id}")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response refreshMetadata(@PathParam("id") int photoId, BaseRequest baseRequest) {
        photoService.refreshMetadata(photoId);
        return ok("photo metadata refresh successfully");
    }

    @Path(ADMIN_PREFIX_STRING + "/delete/{id}")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response deletePhoto(@PathParam("id") int photoId, BaseRequest baseRequest) {
        if (photoService.removeById(photoId)) {
            return ok("photo deleted successfully");
        }
        return internalError("Failed to delete photo with id %s".formatted(photoId));
    }

    @Path(ADMIN_PREFIX_STRING + "/update")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response updatePhoto(PhotoUpdateRequest photoUpdateRequest) {
        Photo photo = photoUpdateRequest.getPhoto();
        if (photoService.editPhotoPartial(photo)) {
            return ok(photo);
        }
        return internalError("Failed to update photo with id %s".formatted(photo.getId()));
    }

    @Path(ADMIN_PREFIX_STRING + "/reverseGeocode")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response reverseGeocode(PhotoReverseGeocodeRequest photoReverseGeocodeRequest) {
        GpsMetadata gpsMetadata = photoReverseGeocodeRequest.getGpsMetadata();

        if (gpsMetadata.getLatitude() == 0 && gpsMetadata.getLongitude() == 0) {
            return badRequest("Can't reverseGeocode for lat=0, long=0");
        }

        MBData mbData = geocodeManager.reverseGeocode(gpsMetadata.getLatitude(), gpsMetadata.getLongitude());

        ReverseGeocodeData reverseGeocodeData = new ReverseGeocodeData();
        mbData.getFeatures().forEach(mbFeature -> {
            MBProperties properties = mbFeature.getProperties();
            if (properties.getFeature_type().equals("place")) {
                reverseGeocodeData.setPlace(properties.getName());
            }
            if (properties.getFeature_type().equals("region")) {
                reverseGeocodeData.setRegion(properties.getName());
            }
            if (properties.getFeature_type().equals("country")) {
                reverseGeocodeData.setCountry(properties.getName());
            }
        });
        if (reverseGeocodeData.hasAllData() && photoService.editGpsMetadataPartial(photoReverseGeocodeRequest.getPhotoId(), reverseGeocodeData)) {
            return ok(null, "Successfully updated gpsMetadata using reverse geocode for photo %s".formatted(photoReverseGeocodeRequest.getPhotoId()));
        }

        return internalError("Failed to update gpsMetadata using reverse geocode for photo %s".formatted(photoReverseGeocodeRequest.getPhotoId()));
    }

    @Path(ADMIN_PREFIX_STRING + "/reverseGeocodeAllPhotos")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response reverseGeocodeAllPhotos(BaseRequest baseRequest) {
        List<Photo> allGpsPhotos = photoService.getAllGps();
        List<LatLong> latLongs = new ArrayList<>();
        allGpsPhotos.forEach(photo -> latLongs.add(new LatLong(photo.getPhotoMetadata().getGps().getLatitude(), photo.getPhotoMetadata().getGps().getLongitude())));

        List<MBData> mbDataList = geocodeManager.reverseGeocodeBatch(latLongs);
        for (int i = 0; i < allGpsPhotos.size() && i < mbDataList.size(); i++) {
            ReverseGeocodeData reverseGeocodeData = new ReverseGeocodeData();
            mbDataList.get(i).getFeatures().forEach(mbFeature -> {
                MBProperties properties = mbFeature.getProperties();
                if (properties.getFeature_type().equals("place")) {
                    reverseGeocodeData.setPlace(properties.getName());
                }
                if (properties.getFeature_type().equals("region")) {
                    reverseGeocodeData.setRegion(properties.getName());
                }
                if (properties.getFeature_type().equals("country")) {
                    reverseGeocodeData.setCountry(properties.getName());
                }
            });

            if (reverseGeocodeData.hasAllData()) {
                photoService.editGpsMetadataPartial(allGpsPhotos.get(i).getId(), reverseGeocodeData);
            }
        }
        return ok(null);
    }

}

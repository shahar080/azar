package azar.gallery.routers;

import azar.gallery.dal.service.PhotoService;
import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.gallery.entities.external.mapbox.api.LatLong;
import azar.gallery.entities.external.mapbox.api.MBProperties;
import azar.gallery.entities.requests.photo.PhotoReverseGeocodeRequest;
import azar.gallery.entities.requests.photo.PhotoUpdateRequest;
import azar.gallery.entities.responses.ReverseGeocodeData;
import azar.gallery.managers.GeocodeManager;
import azar.gallery.metadata.PhotoMetadataExtractor;
import azar.gallery.utils.Utilities;
import azar.shared.cache.CacheKeys;
import azar.shared.cache.CacheManager;
import azar.shared.dal.service.UserService;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;
import static azar.shared.utils.Utilities.getHumanReadableSize;
import static azar.shared.utils.Utilities.isInteger;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class PhotoRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final Vertx vertx;
    private final JsonManager jsonManager;
    private final PhotoService photoService;
    private final CacheManager cacheManager;
    private final PhotoMetadataExtractor photoMetadataExtractor;
    private final UserService userService;
    private final GeocodeManager geocodeManager;

    @Inject
    public PhotoRouter(Vertx vertx, JsonManager jsonManager, PhotoService photoService, CacheManager cacheManager,
                       PhotoMetadataExtractor photoMetadataExtractor, UserService userService, GeocodeManager geocodeManager) {
        this.vertx = vertx;
        this.jsonManager = jsonManager;
        this.photoService = photoService;
        this.cacheManager = cacheManager;
        this.photoMetadataExtractor = photoMetadataExtractor;
        this.userService = userService;
        this.geocodeManager = geocodeManager;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router photoRouter = Router.router(vertx);

        photoRouter.route(OPS_PREFIX_STRING + "/*").handler(JWTAuthHandler.create(jwtAuth));

        photoRouter.post(OPS_PREFIX_STRING + "/upload").handler(this::handleUpload);
        photoRouter.post("/getLightweight/:id").handler(this::handleGetLightweight);
        photoRouter.post("/getWithThumbnail/:id").handler(this::handleGetWithThumbnail);
        photoRouter.post("/getWithPhoto/:id").handler(this::handleGetWithPhoto);
        photoRouter.get("/getIds").handler(this::handleGetIds);
        photoRouter.post(OPS_PREFIX_STRING + "/refreshMetadata/:id").handler(this::handleRefreshMetadata);
        photoRouter.post(OPS_PREFIX_STRING + "/delete/:id").handler(this::handleDeletePhoto);
        photoRouter.post(OPS_PREFIX_STRING + "/update").handler(this::handleUpdatePhoto);
        photoRouter.post(OPS_PREFIX_STRING + "/reverseGeocode").handler(this::handleReverseGeocode);
        photoRouter.post(OPS_PREFIX_STRING + "/reverseGeocodeAllPhotos").handler(this::handleReverseGeocodeAllPhotos);

        return photoRouter;
    }

    private void handleUpload(RoutingContext routingContext) {
        List<FileUpload> fileUploads = routingContext.fileUploads();
        if (fileUploads.isEmpty()) {
            sendBadRequestResponse(routingContext, "No file uploaded");
            return;
        }

        FileUpload fileUpload = fileUploads.getFirst();
        String uploadedFilePath = fileUpload.uploadedFileName();

        routingContext.vertx().fileSystem().readFile(uploadedFilePath)
                .onSuccess(buffer -> {
                    byte[] photoData = buffer.getBytes();
                    PhotoMetadata photoMetadata = photoMetadataExtractor.extractMetadataFromBytes(photoData);
                    Utilities.generateThumbnail(photoData, 100, 200, vertx)
                            .onSuccess(thumbnail -> {
                                Photo photo = Photo.builder()
                                        .data(photoData)
                                        .description("")
                                        .name(fileUpload.fileName())
                                        .photoMetadata(photoMetadata)
                                        .thumbnail(thumbnail)
                                        .size(getHumanReadableSize(buffer.getBytes()))
                                        .build();

                                photoService.add(photo)
                                        .onSuccess(dbPhoto -> {
                                            dbPhoto.setData(new byte[0]);
                                            dbPhoto.setThumbnail(new byte[0]);
                                            sendCreatedResponse(routingContext, jsonManager.toJson(dbPhoto), "Sending photo back to client");
                                            cacheManager.put(CacheKeys.PHOTO_THUMBNAIL.formatted(dbPhoto.getId()), jsonManager.toJson(thumbnail));
                                        })
                                        .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to save uploaded photo %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to save uploaded photo %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to read uploaded photo %s, error: %s".formatted(fileUpload.fileName(), err.getMessage())))
                .eventually(() -> routingContext.vertx().fileSystem().delete(uploadedFilePath)
                        .onSuccess(_ -> logger.info("Temporary file deleted: {}", uploadedFilePath))
                        .onFailure(err -> logger.warn("Failed to delete temporary file: {}", uploadedFilePath, err)));
    }

    private void handleGetLightweight(RoutingContext routingContext) {
        String photoId = routingContext.pathParam("id");
        if (photoId == null || photoId.isEmpty() || !isInteger(photoId)) {
            sendBadRequestResponse(routingContext, "Photo ID is required");
            return;
        }
        photoService.getLightWeightById(Integer.valueOf(photoId))
                .onSuccess(photo -> sendOKResponse(routingContext, jsonManager.toJson(photo), "Sending photo[lightweight] with id %s to client".formatted(photoId)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting photo with id: %s from db, error: %s".formatted(photoId, err.getMessage())));
    }

    private void handleGetWithThumbnail(RoutingContext routingContext) {
        String photoId = routingContext.pathParam("id");
        if (photoId == null || photoId.isEmpty() || !isInteger(photoId)) {
            sendBadRequestResponse(routingContext, "Photo ID is required");
            return;
        }
        photoService.getWithThumbnailById(Integer.valueOf(photoId))
                .onSuccess(photo -> {
                    String base64Data = Base64.getEncoder().encodeToString(photo.getThumbnail());
                    photo.setThumbnail(base64Data.getBytes());
                    sendOKResponse(routingContext, jsonManager.toJson(photo), "Sending photo[with thumbnail] with id %s to client".formatted(photoId));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting photo with id: %s from db, error: %s".formatted(photoId, err.getMessage())));
    }

    private void handleGetWithPhoto(RoutingContext routingContext) {
        String photoId = routingContext.pathParam("id");

        logger.info("Getting photo from db for {}", photoId);
        photoService.getWithPhotoById(Integer.valueOf(photoId))
                .onSuccess(photo -> {
                    String base64Data = Base64.getEncoder().encodeToString(photo.getData());
                    photo.setData(base64Data.getBytes());
                    sendOKResponse(routingContext, jsonManager.toJson(photo), "Sending photo[with photo] with id %s to client".formatted(photoId));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Database error, error: %s".formatted(err.getMessage())));
    }

    private void handleGetIds(RoutingContext routingContext) {
        photoService.getPhotosId()
                .onSuccess(ids -> {
                    if (ids == null) {
                        logger.warn("No photos in db, returning empty list..");
                        ids = Collections.emptyList();
                    }
                    sendOKResponse(routingContext, jsonManager.toJson(ids), "Sent photos id to client");
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting photos id, error: %s".formatted(err.getMessage())));
    }

    private void handleRefreshMetadata(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String photoId = routingContext.pathParam("id");
        if (photoId == null || photoId.isEmpty() || !isInteger(photoId)) {
            sendBadRequestResponse(routingContext, "photo ID is required");
            return;
        }

        userService.isAdmin(currentUser)
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "Unauthorized to refresh photo metadata");
                        return;
                    }

                    photoService.refreshMetadata(Integer.valueOf(photoId))
                            .onSuccess(success -> {
                                if (success) {
                                    sendOKResponse(routingContext, "photo metadata refreshed successfully",
                                            "Successfully refreshed photo metadata with ID: %s".formatted(photoId));
                                } else {
                                    sendInternalErrorResponse(routingContext, "Failed to refresh photo metadata with ID: %s".formatted(photoId));
                                }
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to refresh photo metadata with ID: %s, error: %s".formatted(photoId, err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to refresh photo metadata with ID: %s, error: %s".formatted(photoId, err.getMessage())));
    }

    private void handleDeletePhoto(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String photoId = routingContext.pathParam("id");
        if (photoId == null || photoId.isEmpty() || !isInteger(photoId)) {
            sendBadRequestResponse(routingContext, "photo ID is required");
            return;
        }

        userService.isAdmin(currentUser)
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "Unauthorized to delete photos");
                        return;
                    }

                    photoService.removeById(Integer.valueOf(photoId))
                            .onSuccess(success -> {
                                if (success) {
                                    sendOKResponse(routingContext, "photo deleted successfully",
                                            "Successfully deleted photo with ID: %s".formatted(photoId));
                                } else {
                                    sendInternalErrorResponse(routingContext, "Failed to delete photo with ID: %s".formatted(photoId));
                                }
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to delete photo with ID: %s, error: %s".formatted(photoId, err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to delete photo with ID: %s, error: %s".formatted(photoId, err.getMessage())));
    }

    private void handleUpdatePhoto(RoutingContext routingContext) {
        PhotoUpdateRequest photoUpdateRequest = jsonManager.fromJson(routingContext.body().asString(), PhotoUpdateRequest.class);
        String currentUser = photoUpdateRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        Photo photo = photoUpdateRequest.getPhoto();
        photoService.editPhotoPartial(photo)
                .onSuccess(isSuccess -> {
                    if (isSuccess) {
                        sendOKResponse(routingContext, jsonManager.toJson(photo),
                                "Sending updated photo %s back".formatted(photo.getId()));
                    } else {
                        sendInternalErrorResponse(routingContext, "Failed to update photo with ID: %s".formatted(photo.getId()));
                    }
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to update photo with ID: %s, error: %s".formatted(photo.getId(), err.getMessage())));
    }

    private void handleReverseGeocode(RoutingContext routingContext) {
        PhotoReverseGeocodeRequest photoReverseGeocodeRequest = jsonManager.fromJson(routingContext.body().asString(), PhotoReverseGeocodeRequest.class);
        String currentUser = photoReverseGeocodeRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        GpsMetadata gpsMetadata = photoReverseGeocodeRequest.getGpsMetadata();

        if (gpsMetadata.getLatitude() == 0 && gpsMetadata.getLongitude() == 0) {
            sendBadRequestResponse(routingContext, "Can't reverseGeocode for lat=0, long=0");
            return;
        }

        geocodeManager.reverseGeocode(gpsMetadata.getLatitude(), gpsMetadata.getLongitude())
                .onSuccess(mbData -> {
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
                    if (reverseGeocodeData.hasAllData()) {
                        photoService.editGpsMetadataPartial(photoReverseGeocodeRequest.getPhotoId(), reverseGeocodeData)
                                .onSuccess(isSuccess -> {
                                    if (isSuccess) {
                                        sendOKResponse(routingContext, "Successfully updated gpsMetadata using reverse geocode");
                                    } else {
                                        sendInternalErrorResponse(routingContext, "Failed to update gpsMetadata using reverse geocode");
                                    }
                                })
                                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to update gpsMetadata using reverse geocode"));
                    } else {
                        sendInternalErrorResponse(routingContext, "Could not get reverse geocode data for %s".formatted(gpsMetadata));
                    }
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Failed to update photo with ID: %s, error: %s".formatted(gpsMetadata.getId(), err.getMessage())));
    }

    private void handleReverseGeocodeAllPhotos(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        photoService.getAllGps()
                .onSuccess(photos -> {
                    List<LatLong> latLongs = new ArrayList<>();
                    photos.forEach(photo -> latLongs.add(new LatLong(photo.getPhotoMetadata().getGps().getLatitude(), photo.getPhotoMetadata().getGps().getLongitude())));
                    geocodeManager.reverseGeocodeBatch(latLongs)
                            .onSuccess(mbDatas -> {
                                List<Future<Boolean>> futures = new ArrayList<>();
                                for (int i = 0; i < photos.size() && i < mbDatas.size(); i++) {
                                    ReverseGeocodeData reverseGeocodeData = new ReverseGeocodeData();
                                    mbDatas.get(i).getFeatures().forEach(mbFeature -> {
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
                                        futures.add(photoService.editGpsMetadataPartial(String.valueOf(photos.get(i).getId()), reverseGeocodeData));
                                    }
                                }
                                Future.all(futures)
                                        .onSuccess(_ -> sendOKResponse(routingContext, "Successfully reverse geocoded all photos"))
                                        .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to reverse gecode all photos"));
                            });
                })
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to reverse gecode all photos"));
    }

}

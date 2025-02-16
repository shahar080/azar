package azar.gallery.dal.service;

import azar.gallery.dal.dao.PhotoDao;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.gallery.entities.responses.ReverseGeocodeData;
import azar.gallery.metadata.PhotoMetadataExtractor;
import azar.shared.dal.service.GenericService;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class PhotoService extends GenericService<Photo> {

    private final PhotoDao photoDao;
    private final PhotoMetadataExtractor photoMetadataExtractor;
    private final Vertx vertx;

    @Inject
    public PhotoService(PhotoDao photoDao, PhotoMetadataExtractor photoMetadataExtractor, Vertx vertx) {
        this.photoDao = photoDao;
        this.photoMetadataExtractor = photoMetadataExtractor;
        this.vertx = vertx;
    }

    @Override
    public Future<Set<Photo>> getAll() {
        return photoDao.getAll();
    }

    @Override
    public Future<Photo> add(Photo photo) {
        return photoDao.add(photo);
    }

    @Override
    public Future<Photo> update(Photo photo) {
        return photoDao.update(photo);
    }

    @Override
    public Future<Photo> getById(Integer id) {
        return photoDao.getById(id);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return photoDao.removeById(id);
    }

    public Future<List<Integer>> getPhotosId() {
        return photoDao.getPhotosId();
    }

    public Future<byte[]> getPhoto(Integer id) {
        return photoDao.getPhoto(id);
    }

    public Future<Boolean> refreshMetadata(Integer id) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                photoDao.getPhoto(id)
                        .onSuccess(bytes -> {
                            PhotoMetadata photoMetadata = photoMetadataExtractor.extractMetadataFromBytes(bytes);
                            photoDao.updateMetadata(id, photoMetadata)
                                    .onSuccess(promise::complete)
                                    .onFailure(promise::fail);
                        })
                        .onFailure(promise::fail);
                return null;
            }, false);
        });
    }

    public Future<Boolean> editPhotoPartial(Photo photo) {
        return photoDao.editPhotoPartial(photo);
    }

    public Future<Photo> getLightWeightById(Integer id) {
        return photoDao.getLightWeightById(id);
    }

    public Future<Photo> getWithThumbnailById(Integer id) {
        return photoDao.getWithThumbnailById(id);
    }

    public Future<Photo> getWithPhotoById(Integer id) {
        return photoDao.getWithPhotoById(id);
    }

    public Future<List<Photo>> getHeatmapPhotos() {
        return photoDao.getHeatmapPhotos();
    }

    public Future<Boolean> editGpsMetadataPartial(String photoId, ReverseGeocodeData reverseGeocodeData) {
        String country = reverseGeocodeData.getCountry() != null ? reverseGeocodeData.getCountry() : reverseGeocodeData.getRegion();
        return photoDao.editGpsMetadataPartial(photoId, reverseGeocodeData.getPlace(), country);
    }

    public Future<List<Photo>> getAllGps() {
        return photoDao.getAllGps();
    }
}

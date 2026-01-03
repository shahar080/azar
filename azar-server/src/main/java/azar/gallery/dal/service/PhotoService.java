package azar.gallery.dal.service;

import java.util.List;
import azar.gallery.dal.dao.PhotoDao;
import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.gallery.entities.responses.ReverseGeocodeData;
import azar.gallery.metadata.PhotoMetadataExtractor;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@ApplicationScoped
public class PhotoService extends GenericService<Photo> {

    private final PhotoDao photoDao;
    private final PhotoMetadataExtractor photoMetadataExtractor;

    public PhotoService(PhotoDao photoDao, PhotoMetadataExtractor photoMetadataExtractor) {
        this.photoDao = photoDao;
        this.photoMetadataExtractor = photoMetadataExtractor;
    }

    @Override
    protected GenericDao<Photo> getDao() {
        return photoDao;
    }

    public List<Integer> getPhotosId() {
        return photoDao.getPhotosId();
    }

    public byte[] getPhoto(Integer id) {
        return photoDao.getPhoto(id);
    }

    public void refreshMetadata(Integer id) {
        byte[] photoBytes = photoDao.getPhoto(id);
        PhotoMetadata photoMetadata = photoMetadataExtractor.extractMetadataFromBytes(photoBytes);
        photoDao.updateMetadata(id, photoMetadata);
    }

    public boolean editPhotoPartial(Photo photoToEdit) {
        Photo dbPhoto = photoDao.findById(photoToEdit.getId());
        if (dbPhoto == null) return false;

        // Basic fields
        if (photoToEdit.getName() != null) dbPhoto.setName(photoToEdit.getName());
        if (photoToEdit.getDescription() != null) dbPhoto.setDescription(photoToEdit.getDescription());

        // Nested metadata and GPS with null-safety
        PhotoMetadata srcMeta = photoToEdit.getPhotoMetadata();
        if (srcMeta != null) {
            if (dbPhoto.getPhotoMetadata() == null) {
                dbPhoto.setPhotoMetadata(new PhotoMetadata());
            }
            GpsMetadata srcGps = srcMeta.getGps();
            if (srcGps != null) {
                if (dbPhoto.getPhotoMetadata().getGps() == null) {
                    dbPhoto.getPhotoMetadata().setGps(new GpsMetadata());
                }
                GpsMetadata tgt = dbPhoto.getPhotoMetadata().getGps();
                tgt.setLongitude(srcGps.getLongitude());
                tgt.setLatitude(srcGps.getLatitude());
                tgt.setAltitude(srcGps.getAltitude());
                tgt.setCity(srcGps.getCity());
                tgt.setCountry(srcGps.getCountry());
            }
        }
        // Persistence is handled by managed entity in transaction
        return true;
    }

    public Photo getLightWeightById(Integer id) {
        return photoDao.getLightWeightById(id);
    }

    public Photo getWithThumbnailById(Integer id) {
        return photoDao.getWithThumbnailById(id);
    }

    public Photo getWithPhotoById(Integer id) {
        return photoDao.getWithPhotoById(id);
    }

    public List<Photo> getHeatmapPhotos() {
        return photoDao.getHeatmapPhotos();
    }

    public boolean editGpsMetadataPartial(Integer photoId, ReverseGeocodeData reverseGeocodeData) {
        String country = reverseGeocodeData.getCountry() != null ? reverseGeocodeData.getCountry() : reverseGeocodeData.getRegion();
        Photo photo = photoDao.findById(photoId);
        GpsMetadata gpsMetadata = photo.getPhotoMetadata().getGps();
        if (gpsMetadata != null) {
            gpsMetadata.setCity(reverseGeocodeData.getPlace());
            gpsMetadata.setCountry(country);
            photo.getPhotoMetadata().setGps(gpsMetadata);
            photoDao.persist(photo);
            return true;
        }

        return false;
    }

    public List<Photo> getAllGps() {
        return photoDao.getAllGps();
    }
}

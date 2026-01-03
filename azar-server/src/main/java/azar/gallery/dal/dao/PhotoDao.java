package azar.gallery.dal.dao;

import java.util.List;
import azar.gallery.entities.db.Photo;
import azar.gallery.entities.db.PhotoMetadata;
import azar.shared.dal.dao.GenericDao;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@ApplicationScoped
public class PhotoDao extends GenericDao<Photo> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    public List<Integer> getPhotosId() {
        return listAll().stream().map(Photo::getId).toList();
    }

    public byte[] getPhoto(Integer id) {
        String sql = "SELECT lo_get(p.data) FROM photos p WHERE p.id = :id";
        Object r = getEntityManager()
                .createNativeQuery(sql)
                .setParameter("id", id)
                .getSingleResult();
        if (r instanceof byte[] b) return b;
        logger.warn("Photo with id ({}) has corrupt data", id);
        return new byte[0];
    }

    public void updateMetadata(Integer id, PhotoMetadata updatedMetadata) {
        Photo photo = findById(id);
        photo.setPhotoMetadata(updatedMetadata);
        persist(photo);
    }

    public Photo getLightWeightById(Integer id) {
        Photo photo = findById(id);
        getEntityManager().detach(photo);
        photo.setData(new byte[0]);
        photo.setThumbnail(new byte[0]);
        return photo;
    }

    public Photo getWithThumbnailById(Integer id) {
        Photo photo = findById(id);
        getEntityManager().detach(photo);
        photo.setData(new byte[0]);
        return photo;
    }

    public Photo getWithPhotoById(Integer id) {
        Photo photo = findById(id);
        getEntityManager().detach(photo);
        photo.setThumbnail(new byte[0]);
        return photo;
    }

    public List<Photo> getHeatmapPhotos() {
        return Photo.find("photoMetadata is not null").list();
    }


    public List<Photo> getAllGps() {
        return Photo.find(
                "photoMetadata.gps is not null " +
                        "and photoMetadata.gps.latitude is not null and photoMetadata.gps.longitude is not null " +
                        "and (photoMetadata.gps.latitude <> 0 or photoMetadata.gps.longitude <> 0)"
        ).list();
    }

}

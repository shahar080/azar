package azar.gallery.entities.requests.photo;

import azar.gallery.entities.db.GpsMetadata;
import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@Getter
@AllArgsConstructor
public class PhotoReverseGeocodeRequest extends BaseRequest {
    private String photoId;
    private GpsMetadata gpsMetadata;
}

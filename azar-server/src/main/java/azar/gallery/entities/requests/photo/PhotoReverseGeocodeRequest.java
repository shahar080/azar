package azar.gallery.entities.requests.photo;

import azar.gallery.entities.db.GpsMetadata;
import azar.shared.entities.requests.BaseRequest;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class PhotoReverseGeocodeRequest extends BaseRequest {
    private Integer photoId;
    private GpsMetadata gpsMetadata;
}

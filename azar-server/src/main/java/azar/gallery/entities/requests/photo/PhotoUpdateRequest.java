package azar.gallery.entities.requests.photo;

import azar.gallery.entities.db.Photo;
import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   13/02/2024
 **/
@Getter
@AllArgsConstructor
public class PhotoUpdateRequest extends BaseRequest {
    private Photo photo;
}

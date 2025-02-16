package azar.gallery.entities.responses;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@Data
@NoArgsConstructor
public class ReverseGeocodeData {
    private String place;
    private String region;
    private String country;

    public boolean hasAllData() {
        return place != null && (region != null || country != null);
    }
}

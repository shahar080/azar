package azar.gallery.entities.external.mapbox.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MBProperties {
    private String mapbox_id;
    private String feature_type;
    private String full_address;
    private String name;
    private String name_preferred;
    private MBCoordinates coordinates;
    private String place_formatted;
    private MBContext context;
}

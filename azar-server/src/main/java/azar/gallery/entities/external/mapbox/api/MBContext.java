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
public class MBContext {
    private MBContextEntry locality;  // may represent the city
    private MBContextEntry place;     // may also represent the city
    private MBContextEntry country;   // country information
}

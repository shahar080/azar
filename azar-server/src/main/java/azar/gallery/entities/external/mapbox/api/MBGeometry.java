package azar.gallery.entities.external.mapbox.api;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@Data
@NoArgsConstructor
public class MBGeometry {
    private String type;
    private List<Double> coordinates;
}

package azar.weather.entities.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   03/02/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OWMForecastLatLongRequest {
    private double latitude;
    private double longitude;
}

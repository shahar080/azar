package azar.weather.entities.external.api.open_weather_map.forecast_response;

import azar.weather.entities.external.api.open_weather_map.shared.base.OWMBaseResponse;
import azar.weather.entities.external.api.open_weather_map.forecast_response.inner_objects.OWMForecastCity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   03/02/2025
 **/
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OWMForecastResponse {
    private Integer cod;
    private String message;
    private Integer cnt;
    private List<OWMBaseResponse> list;
    private OWMForecastCity city;
}

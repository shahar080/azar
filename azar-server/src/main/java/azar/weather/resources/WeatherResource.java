package azar.weather.resources;

import azar.shared.resources.BaseResource;
import azar.weather.dal.service.WeatherCityService;
import azar.weather.entities.requests.OWMCitiesByInputRequest;
import azar.weather.entities.requests.OWMForecastLatLongRequest;
import azar.weather.entities.requests.OWMWeatherLatLongRequest;
import azar.weather.managers.WeatherManager;
import jakarta.annotation.security.PermitAll;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
@Path("/api/w/weather")
public class WeatherResource extends BaseResource {

    private final WeatherManager weatherManager;
    private final WeatherCityService weatherCityService;

    public WeatherResource(WeatherManager weatherManager,
                           WeatherCityService weatherCityService) {
        this.weatherManager = weatherManager;
        this.weatherCityService = weatherCityService;
    }

    @Path("/weatherByLatLong")
    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @PermitAll
    public Response weatherByLatLong(OWMWeatherLatLongRequest owmWeatherLatLongRequest) {
        double latitude = owmWeatherLatLongRequest.getLatitude();
        double longitude = owmWeatherLatLongRequest.getLongitude();

        return ok(weatherManager.weatherUsingLatLong(latitude, longitude));
    }

    @Path("/getCitiesByInput")
    @Consumes(MediaType.APPLICATION_JSON)
    @POST
    @PermitAll
    public Response citiesByInput(OWMCitiesByInputRequest owmCitiesByInputRequest) {
        String input = owmCitiesByInputRequest.getInput();
        return ok(weatherCityService.citiesByUserInput(input));
    }

    @Path("/forecastByLatLong")
    @POST
    @PermitAll
    public Response forecastByLatLong(OWMForecastLatLongRequest owmForecastLatLongRequest) {
        double latitude = owmForecastLatLongRequest.getLatitude();
        double longitude = owmForecastLatLongRequest.getLongitude();

        return ok(weatherManager.forecastUsingLatLong(latitude, longitude));
    }

}

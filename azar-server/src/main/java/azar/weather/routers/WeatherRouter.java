package azar.weather.routers;

import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.weather.dal.service.WeatherCityService;
import azar.weather.entities.requests.OWMForecastLatLongRequest;
import azar.weather.entities.requests.OWMCitiesByInputRequest;
import azar.weather.entities.requests.OWMWeatherLatLongRequest;
import azar.weather.managers.WeatherManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
public class WeatherRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final JsonManager jsonManager;
    private final WeatherManager weatherManager;
    private final WeatherCityService weatherCityService;

    @Inject
    public WeatherRouter(JsonManager jsonManager, WeatherManager weatherManager,
                         WeatherCityService weatherCityService) {
        this.jsonManager = jsonManager;
        this.weatherManager = weatherManager;
        this.weatherCityService = weatherCityService;
    }

    public Router create(Vertx vertx) {
        Router weatherRouter = Router.router(vertx);

        weatherRouter.post("/weatherByLatLong").handler(this::weatherByLatLong);
        weatherRouter.post("/getCitiesByInput").handler(this::citiesByInput);
        weatherRouter.post("/forecastByLatLong").handler(this::forecastByLatLong);

        return weatherRouter;
    }

    private void weatherByLatLong(RoutingContext routingContext) {
        OWMWeatherLatLongRequest OWMWeatherLatLongRequest = jsonManager.fromJson(routingContext.body().asString(), OWMWeatherLatLongRequest.class);
        double latitude = OWMWeatherLatLongRequest.getLatitude();
        double longitude = OWMWeatherLatLongRequest.getLongitude();

        weatherManager.weatherUsingLatLong(latitude, longitude)
                .onSuccess(latLongResponse -> sendOKResponse(routingContext, jsonManager.toJson(latLongResponse), "Send Weather back to user for lat(%s), long(%s)".formatted(latitude, longitude)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting weather data, error: %s".formatted(err.getMessage())));
    }

    private void citiesByInput(RoutingContext routingContext) {
        OWMCitiesByInputRequest OWMCitiesByInputRequest = jsonManager.fromJson(routingContext.body().asString(), OWMCitiesByInputRequest.class);
        String input = OWMCitiesByInputRequest.getInput();
        weatherCityService.citiesByUserInput(input)
                .onSuccess(weatherCities -> sendOKResponse(routingContext, jsonManager.toJson(weatherCities), "Send Weather cities to user for userInput(%s)".formatted(input)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting weather cities, error: %s".formatted(err.getMessage())));
    }

    private void forecastByLatLong(RoutingContext routingContext) {
        OWMForecastLatLongRequest owmForecastLatLongRequest = jsonManager.fromJson(routingContext.body().asString(), OWMForecastLatLongRequest.class);
        double latitude = owmForecastLatLongRequest.getLatitude();
        double longitude = owmForecastLatLongRequest.getLongitude();

        weatherManager.forecastUsingLatLong(latitude, longitude)
                .onSuccess(forecastResponse -> sendOKResponse(routingContext, jsonManager.toJson(forecastResponse), "Send Forecast back to user for lat(%s), long(%s)".formatted(latitude, longitude)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting forecast data, error: %s".formatted(err.getMessage())));

    }

}

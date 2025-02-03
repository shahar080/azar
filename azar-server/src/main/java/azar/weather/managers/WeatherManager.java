package azar.weather.managers;

import azar.shared.properties.AppProperties;
import azar.shared.utils.JsonManager;
import azar.weather.entities.external.api.open_weather_map.lat_long_response.OWMLatLongResponse;
import azar.weather.entities.external.api.open_weather_map.forecast_response.OWMForecastResponse;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClient;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
public class WeatherManager {

    private final WebClient webClient;
    private final Vertx vertx;
    private final JsonManager jsonManager;

    private final String apiKey;

    private final String weatherBaseUrl = "https://api.openweathermap.org/data/2.5/weather";
    private final String forecastBaseUrl = "https://api.openweathermap.org/data/2.5/forecast";

    @Inject
    public WeatherManager(Vertx vertx, JsonManager jsonManager, AppProperties appProperties) {
        this.vertx = vertx;
        this.webClient = WebClient.create(vertx);
        this.jsonManager = jsonManager;
        this.apiKey = appProperties.getProperty("OPEN_WEATHER_MAP_API_KEY");
    }

    public Future<OWMLatLongResponse> weatherUsingLatLong(double latitude, double longitude) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    webClient.getAbs(weatherBaseUrl)
                            .addQueryParam("lat", String.valueOf(latitude))
                            .addQueryParam("lon", String.valueOf(longitude))
                            .addQueryParam("appid", apiKey)
                            .addQueryParam("units", "metric") //temperatureUnit.equalsIgnoreCase(CELSIUS) ? "metric" : "imperial"
                            .send()
                            .onSuccess(bufferHttpResponse -> {
                                if (bufferHttpResponse.statusCode() == 200) {
                                    String response = bufferHttpResponse.bodyAsString();
                                    getValuePromise.complete(jsonManager.fromJson(response, OWMLatLongResponse.class));
                                } else {
                                    getValuePromise.fail(bufferHttpResponse.statusMessage());
                                }
                            })
                            .onFailure(getValuePromise::fail);
                    return null;
                }, false));
    }

    public Future<OWMForecastResponse> forecastUsingLatLong(double latitude, double longitude) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    webClient.getAbs(forecastBaseUrl)
                            .addQueryParam("lat", String.valueOf(latitude))
                            .addQueryParam("lon", String.valueOf(longitude))
                            .addQueryParam("appid", apiKey)
                            .addQueryParam("units", "metric") //temperatureUnit.equalsIgnoreCase(CELSIUS) ? "metric" : "imperial"
                            .send()
                            .onSuccess(bufferHttpResponse -> {
                                if (bufferHttpResponse.statusCode() == 200) {
                                    OWMForecastResponse response = jsonManager.fromJson(bufferHttpResponse.bodyAsString(), OWMForecastResponse.class);
                                    getValuePromise.complete(response);
                                } else {
                                    getValuePromise.fail(bufferHttpResponse.statusMessage());
                                }
                            })
                            .onFailure(getValuePromise::fail);
                    return null;
                }, false));
    }

}

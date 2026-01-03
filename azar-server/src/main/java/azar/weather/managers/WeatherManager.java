package azar.weather.managers;

import azar.shared.properties.AppProperties;
import azar.weather.entities.external.api.open_weather_map.forecast_response.OWMForecastResponse;
import azar.weather.entities.external.api.open_weather_map.lat_long_response.OWMLatLongResponse;
import static azar.weather.utils.Constants.FORECAST_BASE_URL;
import static azar.weather.utils.Constants.WEATHER_BASE_URL;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   29/01/2025
 **/
@ApplicationScoped
public class WeatherManager {
    private final Client client;
    private final String apiKey;

    public WeatherManager(AppProperties appProperties) {
        this.apiKey = appProperties.getOpenWeatherApiKey();
        this.client = ClientBuilder.newClient();
    }

    public OWMLatLongResponse weatherUsingLatLong(double latitude, double longitude) {
        Response response = client
                .target(WEATHER_BASE_URL)
                .queryParam("lat", String.valueOf(latitude))
                .queryParam("lon", String.valueOf(longitude))
                .queryParam("appid", apiKey)
                .queryParam("units", "metric") //temperatureUnit.equalsIgnoreCase(CELSIUS) ? "metric" : "imperial"
                .request().get();

        return response.readEntity(OWMLatLongResponse.class);
    }

    public OWMForecastResponse forecastUsingLatLong(double latitude, double longitude) {
        Response response = client
                .target(FORECAST_BASE_URL)
                .queryParam("lat", String.valueOf(latitude))
                .queryParam("lon", String.valueOf(longitude))
                .queryParam("appid", apiKey)
                .queryParam("units", "metric") //temperatureUnit.equalsIgnoreCase(CELSIUS) ? "metric" : "imperial"
                .request().get();

        return response.readEntity(OWMForecastResponse.class);
    }

}

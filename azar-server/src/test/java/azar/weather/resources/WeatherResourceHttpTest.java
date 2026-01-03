package azar.weather.resources;

import azar.weather.dal.service.WeatherCityService;
import azar.weather.entities.external.api.open_weather_map.forecast_response.OWMForecastResponse;
import azar.weather.entities.external.api.open_weather_map.lat_long_response.OWMLatLongResponse;
import azar.weather.managers.WeatherManager;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import static io.restassured.RestAssured.given;
import io.restassured.http.ContentType;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;

@QuarkusTest
class WeatherResourceHttpTest {

    @InjectMock
    WeatherManager weatherManager;

    @InjectMock
    WeatherCityService weatherCityService;

    @Test
    void weatherByLatLong_http200() {
        OWMLatLongResponse resp = new OWMLatLongResponse();
        resp.setName("City");
        when(weatherManager.weatherUsingLatLong(12.3, 45.6)).thenReturn(resp);

        String json = "{\n  \"latitude\": 12.3,\n  \"longitude\": 45.6\n}";
        given()
                .contentType(ContentType.JSON)
                .body(json)
                .when()
                .post("/api/w/weather/weatherByLatLong")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("name", equalTo("City"));
    }

    @Test
    void forecastByLatLong_http200() {
        OWMForecastResponse resp = new OWMForecastResponse();
        resp.setMessage("ok");
        when(weatherManager.forecastUsingLatLong(1.0, 2.0)).thenReturn(resp);

        String json = "{\n  \"latitude\": 1.0,\n  \"longitude\": 2.0\n}";
        given()
                .contentType(ContentType.JSON)
                .body(json)
                .when()
                .post("/api/w/weather/forecastByLatLong")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("message", equalTo("ok"));
    }

    @Test
    void citiesByInput_http200() {
        java.util.List<String> cities = java.util.List.of("Paris", "Perth");
        when(weatherCityService.citiesByUserInput("pe")).thenReturn((java.util.List) cities);

        String json = "{\n  \"input\": \"pe\"\n}";
        given()
                .contentType(ContentType.JSON)
                .body(json)
                .when()
                .post("/api/w/weather/getCitiesByInput")
                .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("size()", is(2));
    }
}

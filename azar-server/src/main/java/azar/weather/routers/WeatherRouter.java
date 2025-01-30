package azar.weather.routers;

import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.weather.entities.requests.GetByLatLongRequest;
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

    @Inject
    public WeatherRouter(JsonManager jsonManager, WeatherManager weatherManager) {
        this.jsonManager = jsonManager;
        this.weatherManager = weatherManager;
    }

    public Router create(Vertx vertx) {
        Router weatherRouter = Router.router(vertx);

        weatherRouter.post("/getByLatLong").handler(this::handleGet);

        return weatherRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        GetByLatLongRequest getByLatLongRequest = jsonManager.fromJson(routingContext.body().asString(), GetByLatLongRequest.class);
        double latitude = getByLatLongRequest.getLatitude();
        double longitude = getByLatLongRequest.getLongitude();

        weatherManager.getUsingLatLong(latitude, longitude)
                .onSuccess(latLongResponse -> sendOKResponse(routingContext, jsonManager.toJson(latLongResponse), "Send Weather back to user for lat(%s), long(%s)".formatted(latitude, longitude)))
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting weather data, error: %s".formatted(err.getMessage())));
    }

}

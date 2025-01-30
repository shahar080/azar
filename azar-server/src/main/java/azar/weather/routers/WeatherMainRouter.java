package azar.weather.routers;

import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
public class WeatherMainRouter {

    private final WeatherRouter weatherRouter;

    @Inject
    public WeatherMainRouter(WeatherRouter weatherRouter) {
        this.weatherRouter = weatherRouter;
    }

    public Router create(Vertx vertx) {
        Router weatherMainRouter = Router.router(vertx);

        weatherMainRouter.route("/weather/*").subRouter(weatherRouter.create(vertx));

        return weatherMainRouter;
    }
}

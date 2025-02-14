package azar.shared.verticals;

import azar.cloud.routers.CloudMainRouter;
import azar.cloud.utils.AuthService;
import azar.gallery.routers.GalleryMainRouter;
import azar.shared.properties.AppProperties;
import azar.weather.routers.WeatherMainRouter;
import azar.whoami.routers.WhoAmIMainRouter;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.ext.web.handler.JWTAuthHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;


/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class ServerVertical extends AbstractVerticle {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;
    private final JWTAuth jwtAuth;

    private final CloudMainRouter cloudMainRouter;
    private final WhoAmIMainRouter whoAmIMainRouter;
    private final WeatherMainRouter weatherMainRouter;
    private final GalleryMainRouter galleryMainRouter;

    private final boolean IS_DEV;
    private final List<String> ALLOWED_ORIGINS;


    @Inject
    public ServerVertical(AppProperties appProperties, AuthService authService,
                          CloudMainRouter cloudMainRouter, WhoAmIMainRouter whoAmIMainRouter,
                          WeatherMainRouter weatherMainRouter, GalleryMainRouter galleryMainRouter) {
        this.appProperties = appProperties;
        this.jwtAuth = authService.getJwtAuth();
        this.cloudMainRouter = cloudMainRouter;
        this.whoAmIMainRouter = whoAmIMainRouter;
        this.weatherMainRouter = weatherMainRouter;
        this.galleryMainRouter = galleryMainRouter;
        this.IS_DEV = appProperties.getBooleanProperty("IS_DEV", false);
        this.ALLOWED_ORIGINS = appProperties.getListProperty("ALLOWED_ORIGINS");
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router mainRouter = Router.router(vertx);
            mainRouter.route().handler(CorsHandler.create()
                    .addOrigins(ALLOWED_ORIGINS)
                    .allowedMethod(HttpMethod.GET)
                    .allowedMethod(HttpMethod.POST)
                    .allowedMethod(HttpMethod.OPTIONS)
                    .allowedHeader("Content-Type")
                    .allowedHeader("Authorization")
                    .maxAgeSeconds(1800)
            );

            mainRouter.route().handler(BodyHandler.create()
                    .setBodyLimit((long) appProperties.getIntProperty("server.file.max.size.mb", 50)
                            * 1024 * 1024));

            Router apiRouter = Router.router(vertx);

            apiRouter.route().handler(this::catchAllRequests);

            apiRouter.route(OPS_PREFIX_STRING + "/*").handler(JWTAuthHandler.create(jwtAuth));

            apiRouter.route("/c/*").subRouter(cloudMainRouter.create(vertx, jwtAuth));
            apiRouter.route("/wai/*").subRouter(whoAmIMainRouter.create(vertx));
            apiRouter.route("/w/*").subRouter(weatherMainRouter.create(vertx));
            apiRouter.route("/g/*").subRouter(galleryMainRouter.create(vertx, jwtAuth));

            mainRouter.route("/api/*").subRouter(apiRouter);

            mainRouter.route().method(HttpMethod.OPTIONS).handler(routingContext -> routingContext.response()
                    .putHeader("Access-Control-Allow-Origin", "*")
                    .putHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                    .setStatusCode(200)
                    .end());

            int serverPort = appProperties.getIntProperty("server.port", 8080);
            String serverHost = appProperties.getProperty("server.host");

            vertx
                    .createHttpServer()
                    .requestHandler(mainRouter)
                    .listen(
                            serverPort,
                            "0.0.0.0"
                    ).onSuccess(_ -> {
                        logger.info("Server is up and listening on {}", String.format("%s:%s", serverHost, serverPort));
                        startPromise.complete();
                    })
                    .onFailure(err -> {
                        logger.error("Server failed to start due to", err);
                        startPromise.fail(err);
                    });
        } catch (Exception e) {
            logger.error("Server failed to start due to", e);
        }
    }

    private void catchAllRequests(RoutingContext routingContext) {
        logger.debug("A {} request was made for path: {}", routingContext.request().method(), routingContext.request().path());

        routingContext.next();
    }

}

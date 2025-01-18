package azar.shared.verticals;

import azar.cloud.routers.PdfRouter;
import azar.cloud.routers.PreferencesRouter;
import azar.cloud.routers.TokenRouter;
import azar.cloud.routers.UserRouter;
import azar.shared.properties.AppProperties;
import azar.whoami.routers.CVRouter;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class ServerVertical extends AbstractVerticle {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final AppProperties appProperties;
    private final PdfRouter pdfRouter;
    private final UserRouter userRouter;
    private final PreferencesRouter preferencesRouter;
    private final TokenRouter tokenRouter;
    private final CVRouter cvRouter;

    @Inject
    public ServerVertical(AppProperties appProperties, PdfRouter pdfRouter, UserRouter userRouter,
                          PreferencesRouter preferencesRouter, TokenRouter tokenRouter,
                          CVRouter cvRouter) {
        this.appProperties = appProperties;
        this.pdfRouter = pdfRouter;
        this.userRouter = userRouter;
        this.preferencesRouter = preferencesRouter;
        this.tokenRouter = tokenRouter;
        this.cvRouter = cvRouter;
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router mainRouter = Router.router(vertx);
            // TODO: 13/12/2024 AZAR-1
            mainRouter.route().handler(CorsHandler.create()
                    .addOrigin("*")// Allow requests from this origin
                    .allowedMethod(HttpMethod.GET)           // Allow GET requests
                    .allowedMethod(HttpMethod.POST)          // Allow POST requests
                    .allowedMethod(HttpMethod.OPTIONS)          // Allow POST requests
                    .allowedHeader("Content-Type")           // Allow Content-Type header
                    .allowedHeader("Authorization")          // Allow Authorization header
                    .allowedHeader("Access-Control-Allow-Origin") // Allow Access-Control-Allow-Origin header
                    .allowedHeader("Access-Control-Allow-Methods") // Allow Allowed Methods header
                    .allowedHeader("Access-Control-Allow-Headers") // Allow Allowed Headers
                    .maxAgeSeconds(3600)  // Cache CORS preflight response for 1 hour
            );

            mainRouter.route().handler(BodyHandler.create()
                    .setBodyLimit((long) appProperties.getIntProperty("server.file.max.size.mb", 50)
                            * 1024 * 1024));

            Router apiRouter = Router.router(vertx);

            apiRouter.route().handler(this::catchAllRequests);

            apiRouter.route("/pdf/*").subRouter(pdfRouter.create(vertx));
            apiRouter.route("/user/*").subRouter(userRouter.create(vertx));
            apiRouter.route("/token/*").subRouter(tokenRouter.create(vertx));
            apiRouter.route("/preference/*").subRouter(preferencesRouter.create(vertx));
            apiRouter.route("/cv/*").subRouter(cvRouter.create(vertx));

            apiRouter.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));

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
        logger.info("A request was made for path: {}", routingContext.request().path());
        routingContext.next();
    }

}

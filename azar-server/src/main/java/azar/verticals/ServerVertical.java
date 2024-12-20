package azar.verticals;

import azar.properties.AppProperties;
import azar.verticals.routers.PdfRouter;
import azar.verticals.routers.TokenRouter;
import azar.verticals.routers.UserRouter;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
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
    private final TokenRouter tokenRouter;

    @Inject
    public ServerVertical(AppProperties appProperties, PdfRouter pdfRouter, UserRouter userRouter,
                          TokenRouter tokenRouter) {
        this.appProperties = appProperties;
        this.pdfRouter = pdfRouter;
        this.userRouter = userRouter;
        this.tokenRouter = tokenRouter;
    }

    @Override
    public void start(Promise<Void> startPromise) {
        try {
            Router router = Router.router(vertx);
            // TODO: 13/12/2024 AZAR-1
            router.route().handler(CorsHandler.create()
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

//            // Set up the HttpServer with SSL enabled
//            PemKeyCertOptions pemOptions = new PemKeyCertOptions()
//                    .setKeyPath(appProperties.getProperty("CERT_KEY_PATH"))   // Private key in PEM format
//                    .setCertPath(appProperties.getProperty("CERT_VALUE_PATH"));  // Certificate in PEM format
//
//            HttpServerOptions options = new HttpServerOptions()
//                    .setSsl(true)
//                    .setKeyCertOptions(pemOptions);  // SSL configuration using PEM certificates

            router.route().handler(BodyHandler.create()
                    .setBodyLimit((long) appProperties.getIntProperty("server.file.max.size.mb", 50)
                            * 1024 * 1024));

            router.route("/pdf/*").subRouter(pdfRouter.create(vertx));
            router.route("/user/*").subRouter(userRouter.create(vertx));
            router.route("/token/*").subRouter(tokenRouter.create(vertx));

            router.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));

            router.route().method(HttpMethod.OPTIONS).handler(routingContext -> {
                routingContext.response()
                        .putHeader("Access-Control-Allow-Origin", "*")
                        .putHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                        .putHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                        .setStatusCode(200)
                        .end();
            });

            int serverPort = appProperties.getIntProperty("server.port", 8080);
            String serverHost = appProperties.getProperty("server.host");

            vertx
                    .createHttpServer()
                    .requestHandler(router)
                    .listen(
                            serverPort,
                            "0.0.0.0"
                    ).onSuccess(ignored -> {
                        logger.info("1Server is up and listening on {}", String.format("%s:%s", serverHost, serverPort));
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

}

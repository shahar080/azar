package azar.shared.verticals;

import azar.cloud.routers.PdfRouter;
import azar.cloud.routers.PreferencesRouter;
import azar.cloud.routers.TokenRouter;
import azar.cloud.routers.UserRouter;
import azar.cloud.utils.AuthService;
import azar.shared.properties.AppProperties;
import azar.whoami.routers.CVRouter;
import azar.whoami.routers.EmailRouter;
import azar.whoami.routers.WhoAmIRouter;
import com.google.inject.Inject;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpHeaders;
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
    private final PdfRouter pdfRouter;
    private final UserRouter userRouter;
    private final PreferencesRouter preferencesRouter;
    private final TokenRouter tokenRouter;
    private final CVRouter cvRouter;
    private final WhoAmIRouter whoAmIRouter;
    private final EmailRouter emailRouter;

    private final boolean IS_DEV;
    private final String REQUIRED_HEADER_KEY;
    private final String REQUIRED_HEADER_VALUE;
    private final List<String> ALLOWED_ORIGINS;


    @Inject
    public ServerVertical(AppProperties appProperties, AuthService authService, PdfRouter pdfRouter,
                          UserRouter userRouter, PreferencesRouter preferencesRouter,
                          TokenRouter tokenRouter, CVRouter cvRouter, WhoAmIRouter whoAmIRouter,
                          EmailRouter emailRouter) {
        this.appProperties = appProperties;
        this.jwtAuth = authService.getJwtAuth();
        this.pdfRouter = pdfRouter;
        this.userRouter = userRouter;
        this.preferencesRouter = preferencesRouter;
        this.tokenRouter = tokenRouter;
        this.cvRouter = cvRouter;
        this.whoAmIRouter = whoAmIRouter;
        this.emailRouter = emailRouter;
        this.IS_DEV = appProperties.getBooleanProperty("IS_DEV", false);
        this.REQUIRED_HEADER_KEY = appProperties.getProperty("REQUIRED_HEADER_KEY");
        this.REQUIRED_HEADER_VALUE = appProperties.getProperty("REQUIRED_HEADER_VALUE");
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
            apiRouter.route(OPS_PREFIX_STRING + "/pdf/*").subRouter(pdfRouter.create(vertx, jwtAuth));
            apiRouter.route(OPS_PREFIX_STRING + "/preference/*").subRouter(preferencesRouter.create(vertx, jwtAuth));
            apiRouter.route("/user/*").subRouter(userRouter.create(vertx, jwtAuth));
            apiRouter.route("/token/*").subRouter(tokenRouter.create(vertx, jwtAuth));

            apiRouter.route("/cv/*").subRouter(cvRouter.create(vertx));
            apiRouter.route("/whoami/*").subRouter(whoAmIRouter.create(vertx));
            apiRouter.route("/email/*").subRouter(emailRouter.create(vertx));

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

        if (!IS_DEV) {
            // validate header
            if (!validateHeader(routingContext)) {
                return;
            }
        }

        routingContext.next();
    }

    private boolean validateHeader(RoutingContext context) {

        String requiredHeader = context.request().getHeader(REQUIRED_HEADER_KEY);

        if (requiredHeader == null || !requiredHeader.equalsIgnoreCase(REQUIRED_HEADER_VALUE)) {
            context.response()
                    .setStatusCode(400)
                    .putHeader(HttpHeaders.CONTENT_TYPE, "text/plain")
                    .end("Missing or invalid headers");
            return false;
        }

        return true;
    }

}

package azar.whoami.routers;

import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
public class WhoAmIMainRouter {

    private final CVRouter cvRouter;
    private final WhoAmIRouter whoAmIRouter;
    private final EmailRouter emailRouter;

    @Inject
    public WhoAmIMainRouter(CVRouter cvRouter, WhoAmIRouter whoAmIRouter, EmailRouter emailRouter) {
        this.cvRouter = cvRouter;
        this.whoAmIRouter = whoAmIRouter;
        this.emailRouter = emailRouter;
    }

    public Router create(Vertx vertx) {
        Router whoAmIMainRouter = Router.router(vertx);

        whoAmIMainRouter.route("/cv/*").subRouter(cvRouter.create(vertx));
        whoAmIMainRouter.route("/whoami/*").subRouter(whoAmIRouter.create(vertx));
        whoAmIMainRouter.route("/email/*").subRouter(emailRouter.create(vertx));

        return whoAmIMainRouter;
    }
}

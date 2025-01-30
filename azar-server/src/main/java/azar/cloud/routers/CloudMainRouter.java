package azar.cloud.routers;

import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
public class CloudMainRouter {

    private final PdfRouter pdfRouter;
    private final PreferencesRouter preferencesRouter;
    private final TokenRouter tokenRouter;
    private final UserRouter userRouter;

    @Inject
    public CloudMainRouter(PdfRouter pdfRouter, PreferencesRouter preferencesRouter,
                           TokenRouter tokenRouter, UserRouter userRouter) {
        this.pdfRouter = pdfRouter;
        this.preferencesRouter = preferencesRouter;
        this.tokenRouter = tokenRouter;
        this.userRouter = userRouter;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router cloudMainRouter = Router.router(vertx);

        cloudMainRouter.route(OPS_PREFIX_STRING + "/pdf/*").subRouter(pdfRouter.create(vertx, jwtAuth));
        cloudMainRouter.route(OPS_PREFIX_STRING + "/preference/*").subRouter(preferencesRouter.create(vertx, jwtAuth));
        cloudMainRouter.route("/token/*").subRouter(tokenRouter.create(vertx, jwtAuth));
        cloudMainRouter.route("/user/*").subRouter(userRouter.create(vertx, jwtAuth));

        return cloudMainRouter;
    }
}

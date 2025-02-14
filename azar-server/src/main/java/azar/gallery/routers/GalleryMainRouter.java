package azar.gallery.routers;

import azar.whoami.routers.CVRouter;
import azar.whoami.routers.EmailRouter;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class GalleryMainRouter {

    private final PhotoRouter photoRouter;

    @Inject
    public GalleryMainRouter(PhotoRouter photoRouter) {
        this.photoRouter = photoRouter;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router whoAmIMainRouter = Router.router(vertx);

        whoAmIMainRouter.route("/photo/*").subRouter(photoRouter.create(vertx, jwtAuth));

        return whoAmIMainRouter;
    }
}

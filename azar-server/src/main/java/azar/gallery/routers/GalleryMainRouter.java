package azar.gallery.routers;

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
    private final HeatmapRouter heatmapRouter;

    @Inject
    public GalleryMainRouter(PhotoRouter photoRouter, HeatmapRouter heatmapRouter) {
        this.photoRouter = photoRouter;
        this.heatmapRouter = heatmapRouter;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router galleryMainRouter = Router.router(vertx);

        galleryMainRouter.route("/photo/*").subRouter(photoRouter.create(vertx, jwtAuth));
        galleryMainRouter.route("/heatMap/*").subRouter(heatmapRouter.create(vertx));

        return galleryMainRouter;
    }
}

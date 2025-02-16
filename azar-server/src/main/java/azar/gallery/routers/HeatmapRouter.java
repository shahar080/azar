package azar.gallery.routers;

import azar.gallery.dal.service.PhotoService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

/**
 * Author: Shahar Azar
 * Date:   15/02/2025
 **/
public class HeatmapRouter extends BaseRouter {

    private final PhotoService photoService;
    private final JsonManager jsonManager;

    @Inject
    public HeatmapRouter(PhotoService photoService, JsonManager jsonManager) {
        this.photoService = photoService;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx) {
        Router heatmapRouter = Router.router(vertx);

        heatmapRouter.get("/getPhotos").handler(this::handleGetPhotos);

        return heatmapRouter;
    }

    private void handleGetPhotos(RoutingContext routingContext) {
        photoService.getHeatmapPhotos()
                .onSuccess(photos -> sendOKResponse(routingContext, jsonManager.toJson(photos), "Sending heatmap photos to client"))
                .onFailure(_ -> sendInternalErrorResponse(routingContext, "Failed to send heatmap photos to client"));
    }

}

package azar.gallery.resources;

import azar.gallery.dal.service.PhotoService;
import azar.shared.resources.BaseResource;
import jakarta.annotation.security.PermitAll;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

/**
 * Author: Shahar Azar
 * Date:   15/02/2025
 **/
@Path("/api/g/heatMap")
public class HeatmapResource extends BaseResource {

    private final PhotoService photoService;

    public HeatmapResource(PhotoService photoService) {
        this.photoService = photoService;
    }

    @Path("/getPhotos")
    @GET
    @Transactional
    @PermitAll
    public Response getPhotos() {
        return ok(photoService.getHeatmapPhotos());
    }

}

package azar.shared.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;

@Path("/")
public class HealthResource extends BaseResource {

    @Path("/health")
    @GET
    public Response health() {
        return ok(null);
    }
}

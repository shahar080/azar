package azar.cloud.resources;

import java.time.Duration;
import java.util.Set;
import azar.shared.properties.AppProperties;
import azar.shared.resources.BaseResource;
import io.quarkus.security.Authenticated;
import io.smallrye.jwt.build.Jwt;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
@Path("/api/token")
public class TokenResource extends BaseResource {

    @Inject
    protected JsonWebToken jwt;
    private final AppProperties appProperties;

    public TokenResource(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    @POST
    @Path("/refresh")
    @Authenticated
    public Response refresh() {
        final String username = jwt.getSubject() != null ? jwt.getSubject() : jwt.getName();
        final Set<String> groups = jwt.getGroups();

        String newAccess = Jwt
                .issuer(appProperties.getJwtIssuer())
                .upn(username)
                .groups(groups)
                .expiresIn(Duration.ofMinutes(appProperties.getJwtMinutesDuration()))
                .sign();

        return ok(newAccess, "%s refreshed token".formatted(username));
    }

}

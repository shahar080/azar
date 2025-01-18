package azar.cloud.routers;

import azar.shared.dal.service.UserService;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.properties.AppProperties;
import azar.cloud.utils.AuthService;
import azar.shared.utils.JsonManager;
import azar.shared.routers.BaseRouter;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;

import java.util.Base64;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class TokenRouter extends BaseRouter {
    private final UserService userService;
    private final AppProperties appProperties;
    private final JsonManager jsonManager;
    private JWTAuth jwtAuth;

    @Inject
    public TokenRouter(UserService userService, AppProperties appProperties, JsonManager jsonManager) {
        this.userService = userService;
        this.appProperties = appProperties;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx) {
        Router tokenRouter = Router.router(vertx);

        this.jwtAuth = new AuthService(vertx, appProperties).getJwtAuth();

        tokenRouter.post("/refresh").handler(this::handleRefreshToken);

        return tokenRouter;
    }

    private void handleRefreshToken(RoutingContext routingContext) {
        BaseRequest baseRequest = jsonManager.fromJson(routingContext.body().asString(), BaseRequest.class);
        String currentUser = baseRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        String authHeader = routingContext.request().getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorizedErrorResponse(routingContext, "Missing or invalid token");
            return;
        }

        String token = authHeader.substring("Bearer ".length());

        try {
            // Decode token without enforcing expiration checks
            JsonObject decodedToken = decodeToken(token);

            // Extract user information (e.g., username) from the decoded token
            String username = decodedToken.getString("userName");
            if (username == null) {
                sendUnauthorizedErrorResponse(routingContext, "Missing or invalid token");
                return;
            }

            if (userService.getUserByUserName(username) == null) {
                sendUnauthorizedErrorResponse(routingContext, "Missing or invalid token");
                return;
            }

            // Generate a new token
            String newToken = jwtAuth.generateToken(
                    new JsonObject().put("username", username),
                    new JWTOptions().setExpiresInSeconds(3600) // New token valid for 1 hour
            );

            sendOKResponse(routingContext, new JsonObject().put("token", newToken).encode(), "Successfully refreshed token");
        } catch (Exception e) {
            // Handle decoding errors or invalid tokens
            sendUnauthorizedErrorResponse(routingContext, "Invalid or expired token");
        }
    }

    private JsonObject decodeToken(String token) {
        try {
            // Split the token into parts (header.payload.signature)
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            // Decode the payload (second part) from Base64
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return new JsonObject(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to decode token", e);
        }
    }

}

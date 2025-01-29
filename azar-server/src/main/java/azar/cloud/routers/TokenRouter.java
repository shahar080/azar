package azar.cloud.routers;

import azar.shared.dal.service.UserService;
import azar.shared.entities.requests.BaseRequest;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.JWTAuthHandler;

import java.util.Base64;

import static azar.cloud.utils.Constants.OPS_PREFIX_STRING;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class TokenRouter extends BaseRouter {
    private final UserService userService;
    private final JsonManager jsonManager;

    @Inject
    public TokenRouter(UserService userService, JsonManager jsonManager) {
        this.userService = userService;
        this.jsonManager = jsonManager;
    }

    public Router create(Vertx vertx, JWTAuth jwtAuth) {
        Router tokenRouter = Router.router(vertx);

        tokenRouter.post("/refresh").handler(routingContext -> handleRefreshToken(routingContext, jwtAuth));

        return tokenRouter;
    }

    private void handleRefreshToken(RoutingContext routingContext, JWTAuth jwtAuth) {
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
            JsonObject decodedToken = decodeToken(token);

            String username = decodedToken.getString("userName");
            if (username == null) {
                sendUnauthorizedErrorResponse(routingContext, "Missing or invalid token");
                return;
            }

            if (userService.getUserByUserName(username) == null) {
                sendUnauthorizedErrorResponse(routingContext, "Missing or invalid token");
                return;
            }

            String newToken = jwtAuth.generateToken(
                    new JsonObject().put("username", username),
                    new JWTOptions().setExpiresInSeconds(3600)
            );

            sendOKResponse(routingContext, new JsonObject().put("token", newToken).encode(), "Successfully refreshed token");
        } catch (Exception e) {
            sendUnauthorizedErrorResponse(routingContext, "Invalid or expired token");
        }
    }

    private JsonObject decodeToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            return new JsonObject(payload);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to decode token", e);
        }
    }

}

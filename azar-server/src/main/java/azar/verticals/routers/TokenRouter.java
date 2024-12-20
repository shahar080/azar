package azar.verticals.routers;

import azar.dal.service.UserService;
import azar.utils.AuthService;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Base64;

/**
 * Author: Shahar Azar
 * Date:   20/12/2024
 **/
public class TokenRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final UserService userService;
    private JWTAuth jwtAuth;

    @Inject
    public TokenRouter(UserService userService) {
        this.userService = userService;
    }

    public Router create(Vertx vertx) {
        Router tokenRouter = Router.router(vertx);

        this.jwtAuth = new AuthService(vertx).getJwtAuth();

        tokenRouter.post("/refresh").handler(this::handleRefreshToken);

        return tokenRouter;
    }

    private void handleRefreshToken(RoutingContext ctx) {
        String authHeader = ctx.request().getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            ctx.response()
                    .setStatusCode(401)
                    .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
            return;
        }

        String token = authHeader.substring("Bearer ".length());

        try {
            // Decode token without enforcing expiration checks
            JsonObject decodedToken = decodeToken(token);

            // Extract user information (e.g., username) from the decoded token
            String username = decodedToken.getString("userName");
            if (username == null) {
                ctx.response()
                        .setStatusCode(401)
                        .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
                return;
            }

            if (userService.getUserByUserName(username) == null) {
                ctx.response()
                        .setStatusCode(401)
                        .end(new JsonObject().put("error", "Unauthorized: Missing or invalid token").encode());
                return;
            }

            // Generate a new token
            String newToken = jwtAuth.generateToken(
                    new JsonObject().put("username", username),
                    new JWTOptions().setExpiresInSeconds(3600) // New token valid for 1 hour
            );

            ctx.response()
                    .setStatusCode(200)
                    .putHeader("Content-Type", "application/json")
                    .end(new JsonObject().put("token", newToken).encode());

        } catch (Exception e) {
            // Handle decoding errors or invalid tokens
            ctx.response()
                    .setStatusCode(401)
                    .end(new JsonObject().put("error", "Invalid or expired token").encode());
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

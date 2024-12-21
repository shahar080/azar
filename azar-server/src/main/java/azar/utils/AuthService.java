package azar.utils;

import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/


@Getter
public class AuthService {
    private final JWTAuth jwtAuth;

    @Inject
    public AuthService(Vertx vertx) {
        this.jwtAuth = JWTAuth.create(vertx, new JWTAuthOptions()
                .addPubSecKey(new PubSecKeyOptions()
                        .setAlgorithm("HS256")
                        .setBuffer("your-secret-key") // TODO: 21/12/2024 AZAR-51
                ));
    }

}

package azar.cloud.utils;

import azar.shared.properties.AppProperties;
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
    public AuthService(Vertx vertx, AppProperties appProperties) {
        this.jwtAuth = JWTAuth.create(vertx, new JWTAuthOptions()
                .addPubSecKey(new PubSecKeyOptions()
                        .setAlgorithm("HS256")
                        .setBuffer(appProperties.getProperty("JWT_SECRET_KEY"))
                ));
    }

}

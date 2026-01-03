package azar.cloud.utils;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.USER_GROUP;
import azar.shared.entities.db.User;
import azar.shared.entities.db.UserType;
import azar.shared.properties.AppProperties;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/


@Getter
@ApplicationScoped
public class AuthService {

    private final AppProperties appProperties;

    public AuthService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String getAuthToken(User user) {
        Set<String> groups = new HashSet<>();
        groups.add(USER_GROUP);
        if (user.getUserType().equals(UserType.ADMIN)) {
            groups.add(ADMIN_GROUP);
        }
        return Jwt.issuer(appProperties.getJwtIssuer())
                .upn(user.getUserName())
                .groups(groups)
                .expiresIn(Duration.ofMinutes(appProperties.getJwtMinutesDuration()))
                .sign();
    }

}

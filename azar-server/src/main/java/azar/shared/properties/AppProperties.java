package azar.shared.properties;

import jakarta.enterprise.context.ApplicationScoped;
import lombok.Getter;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
@ApplicationScoped
@Getter
public class AppProperties {

    @ConfigProperty(name = "azar.open.weather.api.key")
    String openWeatherApiKey;

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String jwtIssuer;

    @ConfigProperty(name = "azar.jwt.minutes.duration")
    Integer jwtMinutesDuration;

    @ConfigProperty(name = "azar.map.box.api.key")
    String mapBoxApiKey;

}

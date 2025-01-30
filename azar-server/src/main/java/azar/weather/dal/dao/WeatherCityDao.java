package azar.weather.dal.dao;

import azar.shared.dal.dao.GenericDao;
import azar.shared.factory.SessionFactoryProvider;
import azar.weather.entities.db.TempWeatherCity;
import azar.weather.entities.db.WeatherCity;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@Singleton
public class WeatherCityDao extends GenericDao<WeatherCity> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    public WeatherCityDao(Vertx vertx, SessionFactoryProvider sessionFactoryProvider) {
        super(vertx, sessionFactoryProvider);
    }

    public Future<List<WeatherCity>> getByUserInput(String userInput) {
        return vertx.executeBlocking(() -> {
            try (Session session = openSession()) {
                return session
                        .createQuery(
                                "SELECT wc FROM WeatherCity wc WHERE LOWER(wc.name) LIKE LOWER(:userInput) OR LOWER(wc.country) LIKE LOWER(:userInput)",
                                WeatherCity.class
                        )
                        .setParameter("userInput", "%" + userInput + "%")
                        .setMaxResults(20)
                        .getResultList();
            } catch (Exception e) {
                logger.error("Could not getByUserInput from db! userInput {} ", userInput, e);
            }
            return null;
        }, false);

    }

    @Override
    protected Class<WeatherCity> getType() {
        return WeatherCity.class;
    }
}

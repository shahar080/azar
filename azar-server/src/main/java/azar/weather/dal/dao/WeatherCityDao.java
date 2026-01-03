package azar.weather.dal.dao;

import java.util.List;
import java.util.Locale;
import azar.shared.dal.dao.GenericDao;
import azar.weather.entities.db.WeatherCity;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@ApplicationScoped
public class WeatherCityDao extends GenericDao<WeatherCity> {

    public List<WeatherCity> getByUserInput(String userInput) {
        String like = "%" + userInput.toLowerCase(Locale.ROOT) + "%";
        return find("lower(name) like ?1 or lower(country) like ?1", like)
                .page(Page.of(0, 20))
                .list();
    }

}

package azar.weather.dal.service;

import java.util.List;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import azar.weather.dal.dao.WeatherCityDao;
import azar.weather.entities.db.WeatherCity;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
@ApplicationScoped
public class WeatherCityService extends GenericService<WeatherCity> {

    private final WeatherCityDao weatherCityDao;

    public WeatherCityService(WeatherCityDao weatherCityDao) {
        this.weatherCityDao = weatherCityDao;
    }

    @Override
    protected GenericDao<WeatherCity> getDao() {
        return weatherCityDao;
    }

    public List<WeatherCity> citiesByUserInput(String userInput) {
        return weatherCityDao.getByUserInput(userInput);
    }

}

package azar.weather.dal.service;

import azar.shared.dal.service.GenericService;
import azar.weather.dal.dao.WeatherCityDao;
import azar.weather.entities.db.WeatherCity;
import com.google.inject.Inject;
import io.vertx.core.Future;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   30/01/2025
 **/
public class WeatherCityService extends GenericService<WeatherCity> {

    private final WeatherCityDao weatherCityDao;

    @Inject
    public WeatherCityService(WeatherCityDao weatherCityDao) {
        this.weatherCityDao = weatherCityDao;
    }

    @Override
    public Future<Set<WeatherCity>> getAll() {
        return weatherCityDao.getAll();
    }

    @Override
    public Future<WeatherCity> add(WeatherCity weatherCity) {
        return weatherCityDao.add(weatherCity);
    }

    @Override
    public Future<WeatherCity> update(WeatherCity weatherCity) {
        return weatherCityDao.update(weatherCity);
    }

    @Override
    public Future<WeatherCity> getById(Integer id) {
        return weatherCityDao.getById(id);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return weatherCityDao.removeById(id);
    }

    public Future<List<WeatherCity>> getByUserInput(String userInput) {
        return weatherCityDao.getByUserInput(userInput);
    }

}

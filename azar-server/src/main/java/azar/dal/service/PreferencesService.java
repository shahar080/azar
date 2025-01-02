package azar.dal.service;

import azar.dal.dao.PreferencesDao;
import azar.entities.db.Preference;
import com.google.inject.Inject;
import io.vertx.core.Future;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
public class PreferencesService extends GenericService<Preference> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    @Inject
    private PreferencesDao preferencesDao;

    @Override
    public Future<Set<Preference>> getAll() {
        return preferencesDao.getAll();
    }

    @Override
    public Future<Preference> add(Preference preference) {
        return preferencesDao.add(preference);
    }

    @Override
    public Future<Preference> update(Preference newItem) {
        return preferencesDao.update(newItem);
    }

    @Override
    public Future<Preference> getById(Integer id) {
        return preferencesDao.getById(id);
    }

    @Override
    public Future<Boolean> remove(Preference preference) {
        return preferencesDao.remove(preference);
    }

    @Override
    public Future<Boolean> removeById(Integer id) {
        return preferencesDao.removeById(id);
    }

    public Future<String> getValue(String key) {
        return preferencesDao.getValue(key);
    }

    public Future<Boolean> getBooleanValue(String key) {
        return preferencesDao.getBooleanValue(key);
    }

    public Future<Preference> getByKey(String key) {
        return preferencesDao.getByKey(key);
    }

    public Future<List<Preference>> getAllClientPaginated(int offset, int limit, String whereClause) {
        return preferencesDao.getAllPaginated(offset, limit, whereClause);
    }
}

package azar.cloud.dal.service;

import java.util.Set;
import azar.cloud.dal.dao.PreferencesDao;
import azar.cloud.entities.db.Preference;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.dao.UserDao;
import azar.shared.dal.service.GenericService;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@ApplicationScoped
public class PreferencesService extends GenericService<Preference> {

    private final PreferencesDao preferencesDao;
    private final UserDao userDao;

    public PreferencesService(PreferencesDao preferencesDao, UserDao userDao) {
        this.preferencesDao = preferencesDao;
        this.userDao = userDao;
    }

    @Override
    protected GenericDao<Preference> getDao() {
        return preferencesDao;
    }

    public Set<Preference> getAllUsers(Integer userId) {
        return userDao.findById(userId).getPreferences();
    }


    public String getValue(String key, Integer userId) {
        return preferencesDao.getValue(key, userId);
    }

    public boolean getBooleanValue(String key, Integer userId) {
        return preferencesDao.getBooleanValue(key, userId);
    }

    public Preference getByKey(String key, Integer userId) {
        return preferencesDao.getByKey(key, userId);
    }

}

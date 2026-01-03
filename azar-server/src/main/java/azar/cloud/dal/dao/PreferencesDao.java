package azar.cloud.dal.dao;

import azar.cloud.entities.db.Preference;
import azar.shared.dal.dao.GenericDao;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@ApplicationScoped
public class PreferencesDao extends GenericDao<Preference> {

    public String getValue(String key, Integer userId) {
        return getByKey(key, userId).getValue();
    }

    public boolean getBooleanValue(String key, Integer userId) {
        return Boolean.parseBoolean(getValue(key, userId));
    }

    public Preference getByKey(String key, Integer userId) {
        return Preference.<Preference>find("key = ?1 and user.id = ?2", key, userId)
                .firstResult();
    }

    public boolean removeAllByUserId(Integer userId) {
        return Preference.delete("userId", userId) > 0;
    }

}

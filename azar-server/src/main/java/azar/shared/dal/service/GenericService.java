package azar.shared.dal.service;

import java.util.List;
import azar.shared.dal.dao.GenericDao;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: Generic Dao definition
 **/
public abstract class GenericService<T> {

    protected abstract GenericDao<T> getDao();

    public List<T> getAll() {
        return getDao().listAll();
    }

    public T merge(T t) {
        getDao().persist(t);
        return t;
    }

    public T getById(Integer id) {
        return getDao().findById(id);
    }

    public boolean removeById(Integer id) {
        return getDao().deleteById(id);
    }

    public T getFirst() {
        return getDao().findAll().firstResult();
    }

    public void detach(T t) {
        getDao().getEntityManager().detach(t);
    }

}

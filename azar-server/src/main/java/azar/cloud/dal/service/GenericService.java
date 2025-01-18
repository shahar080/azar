package azar.cloud.dal.service;

import io.vertx.core.Future;

import java.util.Set;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: Generic Dao definition
 **/
public abstract class GenericService<T> {

    public abstract Future<Set<T>> getAll();

    public abstract Future<T> add(T t);

    public abstract Future<T> update(T newItem);

    public abstract Future<T> getById(Integer id);

    public abstract Future<Boolean> remove(T t);

    public abstract Future<Boolean> removeById(Integer id);

}

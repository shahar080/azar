package azar.shared.utils;


import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import java.util.concurrent.TimeUnit;

/**
 * Author: Shahar Azar
 * Date:   22/12/2024
 **/
@Singleton
public class CacheManager {

    private final Cache<String, byte[]> cache;

    @Inject
    public CacheManager() {
        this.cache = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    public void put(String key, byte[] value) {
        cache.put(key, value);
    }

    public byte[] get(String key) {
        return cache.getIfPresent(key);
    }

    public void remove(String key) {
        cache.invalidate(key);
    }
}
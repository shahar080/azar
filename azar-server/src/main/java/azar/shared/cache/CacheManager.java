package azar.shared.cache;


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

    private final Cache<String, String> cache;

    @Inject
    public CacheManager() {
        this.cache = CacheBuilder.newBuilder()
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    public void put(String key, String value) {
        cache.put(key, value);
    }

    public String get(String key) {
        return cache.getIfPresent(key);
    }

    public void remove(String key) {
        cache.invalidate(key);
    }

}
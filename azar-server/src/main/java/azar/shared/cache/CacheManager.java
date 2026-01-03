package azar.shared.cache;

import java.util.concurrent.TimeUnit;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   22/12/2024
 **/
@ApplicationScoped
public class CacheManager {

    private final Cache<String, String> cache;

    public CacheManager() {
        this.cache = CacheBuilder.newBuilder()
                .maximumSize(10000)
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

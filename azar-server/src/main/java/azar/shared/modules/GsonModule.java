package azar.shared.modules;

import azar.shared.adapters.InstantTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import io.vertx.core.Vertx;

import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
public class GsonModule extends AbstractModule {
    @Override
    protected void configure() {
        bind(Vertx.class).toInstance(Vertx.vertx());
    }

    @Provides
    public Gson provideGson() {
        return new GsonBuilder()
                .registerTypeAdapter(Instant.class, new InstantTypeAdapter()) // Register the custom adapter
                .create();
    }
}

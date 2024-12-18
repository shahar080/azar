package azar.modules;

import azar.adapters.InstantTypeAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.inject.AbstractModule;
import com.google.inject.Provides;

import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 * Purpose: //TODO add purpose for class GsonModule
 **/
public class GsonModule extends AbstractModule {
    @Override
    protected void configure() {
        // Other bindings if needed
    }

    @Provides
    public Gson provideGson() {
        return new GsonBuilder()
                .registerTypeAdapter(Instant.class, new InstantTypeAdapter()) // Register the custom adapter
                .create();
    }
}

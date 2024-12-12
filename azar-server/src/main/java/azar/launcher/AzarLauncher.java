package azar.launcher;

import azar.modules.ServerModule;
import azar.verticals.ServerVertical;
import com.google.inject.Guice;
import com.google.inject.Injector;
import io.vertx.core.Vertx;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class AzarLauncher
 **/
public class AzarLauncher {
    public static void main(String[] args) {
        Injector injector = Guice.createInjector(new ServerModule());
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(injector.getInstance(ServerVertical.class));
    }
}

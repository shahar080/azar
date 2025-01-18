package azar.shared.launcher;

import azar.shared.modules.GsonModule;
import azar.shared.modules.ServerModule;
import azar.shared.verticals.ServerVertical;
import com.google.inject.Guice;
import com.google.inject.Injector;
import io.vertx.core.Vertx;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class AzarLauncher {
    public static void main(String[] args) {
        Injector injector = Guice.createInjector(new ServerModule(), new GsonModule());
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(injector.getInstance(ServerVertical.class));
    }
}

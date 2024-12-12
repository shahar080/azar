package azar.verticals;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.Promise;
import io.vertx.ext.web.Router;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class ServerVertical
 **/
public class ServerVertical extends AbstractVerticle {

    private final int SERVER_PORT = 8080; // TODO: 12/12/2024 SHAHAR-8


    @Override
    public void start(Promise<Void> startPromise) {
        Router router = Router.router(vertx);

        router.route("/test/").handler(routingContext -> routingContext.response().setStatusCode(200).end("Hi"));


        vertx
                .createHttpServer()
                .requestHandler(router)
                .listen(
                        // Retrieve the port from the configuration,
                        // default to 8080.
                        config().getInteger("http.port", SERVER_PORT),
                        "localhost"
                ).onSuccess(ignored -> {
                    System.out.println("Server is up and listening on port: " + SERVER_PORT);
                    startPromise.complete();
                })
                .onFailure(err -> {
                    System.out.println("Server failed to start..");
                    startPromise.fail(err);
                });
    }
}

package azar.shared.startup;

import io.quarkus.runtime.ShutdownEvent;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class AppLifecycle {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    void onStart(@Observes StartupEvent ev) {
        String startupMessage =
                "\n" +
                        "*".repeat(46) +
                        "\n" +
                        "******Azar backend is up and listening********" +
                        "\n" +
                        "*".repeat(46);
        logger.info(startupMessage);
    }

    void onStop(@Observes ShutdownEvent ev) {
        logger.info("Azar backend is shutting down...");
    }
}

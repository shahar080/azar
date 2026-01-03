package azar.testinfra;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import jakarta.inject.Inject;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

/**
 * Base class for HTTP/Integration tests that boot a full Quarkus runtime.
 * <p>
 * Design goals:
 * - Clear separation from fast unit tests (@Tag("integration")).
 * - Runs with a custom Test Profile that supplies datasource overrides.
 * - Offline-friendly: no Testcontainers; connects to a local PostgreSQL.
 */
@QuarkusTest
@TestProfile(IntegrationTestProfile.class)
@Tag("integration")
@EnabledIfSystemProperty(named = "RUN_IT", matches = "true")
public abstract class BaseIntegrationTest {

    @Inject
    Flyway flyway;

    @BeforeEach
    void cleanDatabase() {
        // Ensure a clean schema for every test when running against a fixed DB
        // Requires quarkus.flyway.clean-disabled=false in test config
        flyway.clean();
        flyway.migrate();
    }

    // You can add common RestAssured configuration here if needed.
}

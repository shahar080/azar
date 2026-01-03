package azar.testinfra;

import java.util.HashMap;
import java.util.Map;
import io.quarkus.test.junit.QuarkusTestProfile;

/**
 * Quarkus test profile for integration tests.
 * <p>
 * This profile is designed to be used together with a PostgreSQL Testcontainer in
 * long-lived projects. In this repository we keep it dependency-free so the
 * default build remains green even without Docker or external registries. When
 * you enable Testcontainers in your environment, start a singleton
 * PostgreSQLContainer before tests and feed its JDBC settings into the map
 * returned by {@link #getConfigOverrides()}.
 * <p>
 * By default, this profile reads JDBC settings from system properties so you can
 * point tests at an existing Postgres instance if desired:
 * -DTEST_DB_URL=jdbc:postgresql://localhost:5432/azar
 * -DTEST_DB_USERNAME=postgres
 * -DTEST_DB_PASSWORD=postgres
 * <p>
 * Flyway migrations are enabled at start.
 */
public class IntegrationTestProfile implements QuarkusTestProfile {

    @Override
    public String getConfigProfile() {
        // Use the default profile; we override properties directly.
        return "test";
    }

    @Override
    public Map<String, String> getConfigOverrides() {
        var cfg = new HashMap<String, String>();
        // Read JDBC from system properties or default to local fixed PostgreSQL
        String url = System.getProperty("TEST_DB_URL", "jdbc:postgresql://localhost:5432/azar?currentSchema=public");
        String user = System.getProperty("TEST_DB_USERNAME", "postgres");
        String pass = System.getProperty("TEST_DB_PASSWORD", "postgres");
        cfg.put("quarkus.datasource.db-kind", "postgresql");
        cfg.put("quarkus.datasource.jdbc.url", url);
        cfg.put("quarkus.datasource.username", user);
        cfg.put("quarkus.datasource.password", pass);
        // Explicitly disable Dev Services (offline, no containers)
        cfg.put("quarkus.datasource.devservices.enabled", "false");
        // Ensure ORM is active for integration tests
        cfg.put("quarkus.hibernate-orm.active", "true");
        // Ensure Flyway runs and can clean between tests (BaseIntegrationTest does clean+migrate)
        cfg.put("quarkus.flyway.migrate-at-start", "true");
        cfg.put("quarkus.flyway.clean-disabled", "false");
        // Keep tests deterministic
        cfg.put("quarkus.default-locale", "en-US");
        return cfg;
    }

    @Override
    public boolean disableApplicationLifecycleObservers() {
        // Keep default behavior
        return QuarkusTestProfile.super.disableApplicationLifecycleObservers();
    }
}

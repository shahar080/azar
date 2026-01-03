package azar.testinfra;

import java.util.Objects;
import java.util.Properties;

/**
 * Utilities for safely modifying system properties in tests.
 * <p>
 * Use the returned ScopedProperty in a try-with-resources block to ensure properties are restored
 * even when assertions fail:
 * <p>
 * try (var scope = SystemPropertyUtil.withTemporarySystemProperty("MY_KEY", "value")) {
 * // run code that depends on the property
 * }
 */
public final class SystemPropertyUtil {
    private SystemPropertyUtil() {
    }

    public static ScopedProperty withTemporarySystemProperty(String key, String value) {
        Objects.requireNonNull(key, "key");
        String previous = System.getProperty(key);
        if (value == null) {
            System.clearProperty(key);
        } else {
            System.setProperty(key, value);
        }
        return new ScopedProperty(key, previous);
    }

    public static ScopedProperties withTemporarySystemProperties(Properties overrides) {
        Objects.requireNonNull(overrides, "overrides");
        Properties previous = new Properties();
        previous.putAll(System.getProperties());
        // apply overrides
        for (String name : overrides.stringPropertyNames()) {
            String val = overrides.getProperty(name);
            if (val == null) System.clearProperty(name);
            else System.setProperty(name, val);
        }
        return new ScopedProperties(previous);
    }

    /**
     * Restores a single property to its previous value on close.
     */
    public static final class ScopedProperty implements AutoCloseable {
        private final String key;
        private final String previous;
        private boolean closed;

        private ScopedProperty(String key, String previous) {
            this.key = key;
            this.previous = previous;
        }

        @Override
        public void close() {
            if (closed) return;
            closed = true;
            if (previous == null) System.clearProperty(key);
            else System.setProperty(key, previous);
        }
    }

    /**
     * Restores the full properties snapshot on close.
     */
    public static final class ScopedProperties implements AutoCloseable {
        private final Properties previous;
        private boolean closed;

        private ScopedProperties(Properties previous) {
            this.previous = previous;
        }

        @Override
        public void close() {
            if (closed) return;
            closed = true;
            System.setProperties(previous);
        }
    }
}

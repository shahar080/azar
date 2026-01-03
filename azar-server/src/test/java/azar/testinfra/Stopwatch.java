package azar.testinfra;

import java.time.Duration;
import java.time.Instant;

/**
 * Minimal stopwatch for measuring code blocks in tests.
 * <p>
 * Example:
 * Stopwatch sw = Stopwatch.startNew();
 * doWork();
 * Duration took = sw.elapsed();
 * sw.assertUnder(Duration.ofMillis(200));
 */
public final class Stopwatch {
    private Instant start;
    private Instant stop;

    private Stopwatch() {
    }

    public static Stopwatch startNew() {
        Stopwatch s = new Stopwatch();
        s.start();
        return s;
    }

    public Stopwatch start() {
        this.start = Instant.now();
        this.stop = null;
        return this;
    }

    public Stopwatch stop() {
        this.stop = Instant.now();
        return this;
    }

    public Duration elapsed() {
        Instant end = stop != null ? stop : Instant.now();
        if (start == null) throw new IllegalStateException("Stopwatch was not started");
        return Duration.between(start, end);
    }

    /**
     * Asserts that the elapsed time is strictly under the given duration.
     */
    public void assertUnder(Duration max) {
        Duration e = elapsed();
        if (e.compareTo(max) >= 0) {
            throw new AssertionError("Expected under " + max.toMillis() + " ms but took " + e.toMillis() + " ms");
        }
    }

    /**
     * Convenience to measure a runnable and return the duration.
     */
    public static Duration measure(Runnable r) {
        Stopwatch s = startNew();
        try {
            r.run();
        } finally {
            s.stop();
        }
        return s.elapsed();
    }
}

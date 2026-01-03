package azar.testinfra;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.function.BooleanSupplier;
import java.util.function.Supplier;

/**
 * Small dependency-free awaiting helpers for tests dealing with async code.
 * <p>
 * These utilities avoid pulling in Awaitility while still providing
 * ergonomic polling with sensible defaults. Prefer short timeouts and
 * tight poll intervals to keep the suite fast and deterministic.
 */
public final class AwaitTestUtil {
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration DEFAULT_POLL = Duration.ofMillis(25);

    private AwaitTestUtil() {
    }

    /**
     * Wait until the condition returns true or timeout elapses.
     */
    public static void awaitUntil(BooleanSupplier condition) {
        awaitUntil(condition, DEFAULT_TIMEOUT, DEFAULT_POLL);
    }

    /**
     * Wait until the condition returns true or timeout elapses.
     */
    public static void awaitUntil(BooleanSupplier condition, Duration timeout, Duration pollInterval) {
        Objects.requireNonNull(condition, "condition");
        Objects.requireNonNull(timeout, "timeout");
        Objects.requireNonNull(pollInterval, "pollInterval");
        Instant deadline = Instant.now().plus(timeout);
        Throwable lastError = null;
        while (Instant.now().isBefore(deadline)) {
            try {
                if (condition.getAsBoolean()) return;
                lastError = null;
            } catch (Throwable t) { // allow transient failures inside condition
                lastError = t;
            }
            sleep(pollInterval);
        }
        if (lastError != null) {
            AssertionError ae = new AssertionError("Condition failed before timeout with exception: " + lastError);
            ae.initCause(lastError);
            throw ae;
        }
        throw new AssertionError("Condition was not met within " + timeout.toMillis() + " ms");
    }

    /**
     * Polls supplier until the value equals expected (using equals) or timeout elapses.
     */
    public static <T> T awaitEquals(Supplier<T> supplier, T expected) {
        return awaitEquals(supplier, expected, DEFAULT_TIMEOUT, DEFAULT_POLL);
    }

    /**
     * Polls supplier until the value equals expected (using equals) or timeout elapses.
     */
    public static <T> T awaitEquals(Supplier<T> supplier, T expected, Duration timeout, Duration pollInterval) {
        Objects.requireNonNull(supplier, "supplier");
        Instant deadline = Instant.now().plus(timeout);
        T last = null;
        while (Instant.now().isBefore(deadline)) {
            last = supplier.get();
            if (Objects.equals(last, expected)) return last;
            sleep(pollInterval);
        }
        throw new AssertionError("Expected to observe '" + expected + "' within " + timeout.toMillis() + " ms but last value was '" + last + "'");
    }

    private static void sleep(Duration d) {
        try {
            Thread.sleep(Math.max(1, d.toMillis()));
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}

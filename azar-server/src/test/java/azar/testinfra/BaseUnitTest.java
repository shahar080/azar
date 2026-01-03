package azar.testinfra;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;
import org.assertj.core.api.junit.jupiter.SoftAssertionsExtension;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.TestInstance;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_METHOD;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * Base class for plain unit tests that use Mockito with pragmatic defaults for large suites.
 * <p>
 * What this gives you by default:
 * - Mockito JUnit 5 extension and STRICT_STUBS to catch unused/missing stubbings early.
 * - AssertJ SoftAssertions support via extension (opt-in parameter in test methods).
 * - Deterministic defaults for Locale (en-US) and TimeZone (UTC) without extra dependencies.
 * - Class-level timeout to prevent accidental hangs (2 seconds per test).
 * - Per-method test instances (parallel-friendly, no shared state across tests).
 * - Optional helpers: fixed Clock for deterministic time.
 * <p>
 * How to use:
 * - Extend this class: class MyServiceTest extends BaseUnitTest { ... }
 * - Use @Mock and @InjectMocks as usual.
 * - To use SoftAssertions, declare a parameter: void test(SoftAssertions softly) { ... }
 * - If a test needs more time, override with @Timeout on the method.
 */
@ExtendWith({MockitoExtension.class, SoftAssertionsExtension.class})
@MockitoSettings(strictness = Strictness.STRICT_STUBS)
@Timeout(value = 2, unit = TimeUnit.SECONDS)
@TestInstance(PER_METHOD)
@Tag("unit")
public abstract class BaseUnitTest {
    private Locale previousLocale;
    private TimeZone previousTimeZone;

    @BeforeEach
    void __setDeterministicDefaults() {
        previousLocale = Locale.getDefault();
        previousTimeZone = TimeZone.getDefault();
        Locale.setDefault(Locale.forLanguageTag("en-US"));
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    @AfterEach
    void __restoreDefaults() {
        if (previousLocale != null) Locale.setDefault(previousLocale);
        if (previousTimeZone != null) TimeZone.setDefault(previousTimeZone);
    }

    // Deterministic time helpers (opt-in by passing this clock to your code under test)
    protected Clock fixedClock = Clock.fixed(Instant.parse("2030-01-01T00:00:00Z"), ZoneOffset.UTC);

    protected void advanceClock(Duration d) {
        fixedClock = Clock.fixed(Instant.now(fixedClock).plus(d), ZoneOffset.UTC);
    }

    /**
     * Convenience to temporarily set a system property within try-with-resources.
     * Example:
     * try (var p = withTemporarySystemProperty("foo","bar")) { ... }
     */
    protected SystemPropertyUtil.ScopedProperty withTemporarySystemProperty(String key, String value) {
        return SystemPropertyUtil.withTemporarySystemProperty(key, value);
    }
}

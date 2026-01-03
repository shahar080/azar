package azar.testinfra;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Lightweight random data helpers for tests.
 * <p>
 * Determinism: You can control the seed via system property TEST_RANDOM_SEED.
 * If not set, a secure random seed is generated once per JVM.
 */
public final class RandomTestData {
    private static final String ALNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final long SEED;
    private static final Random RNG;

    static {
        String prop = System.getProperty("TEST_RANDOM_SEED");
        long seed;
        if (prop != null) {
            try {
                seed = Long.parseLong(prop);
            } catch (NumberFormatException nfe) {
                seed = prop.hashCode();
            }
        } else {
            seed = new SecureRandom().nextLong();
        }
        SEED = seed;
        RNG = new Random(SEED);
        // Expose the seed so failures can be reproduced by re-running with -DTEST_RANDOM_SEED=<value>
        System.out.println("[TEST] RandomTestData seed=" + SEED);
    }

    private RandomTestData() {
    }

    public static long seed() {
        return SEED;
    }

    public static String string(int length) {
        if (length <= 0) return "";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALNUM.charAt(RNG.nextInt(ALNUM.length())));
        }
        return sb.toString();
    }

    public static String uuid() {
        return UUID.randomUUID().toString();
    }

    public static String email() {
        return ("user" + intInRange(1000, 9999)) + "+" + string(5).toLowerCase(Locale.ROOT) + "@example.test";
    }

    public static int intInRange(int minInclusive, int maxInclusive) {
        if (minInclusive > maxInclusive) throw new IllegalArgumentException("min > max");
        return minInclusive + RNG.nextInt((maxInclusive - minInclusive) + 1);
    }

    public static long longInRange(long minInclusive, long maxInclusive) {
        if (minInclusive > maxInclusive) throw new IllegalArgumentException("min > max");
        long bound = (maxInclusive - minInclusive) + 1;
        long r = Math.abs(RNG.nextLong());
        return minInclusive + (r % bound);
    }

    public static <T> List<T> listOf(Supplier<T> factory, int count) {
        Objects.requireNonNull(factory, "factory");
        if (count < 0) throw new IllegalArgumentException("count < 0");
        List<T> out = new ArrayList<>(count);
        for (int i = 0; i < count; i++) out.add(factory.get());
        return out;
    }
}

package azar.testinfra;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Tiny JSON helpers for tests so that test code stays readable and focused.
 * <p>
 * Notes:
 * - Uses a dedicated ObjectMapper instance for tests; customize here if tests require specific modules.
 * - Wraps checked exceptions into RuntimeException to reduce boilerplate in tests.
 */
public final class JsonTestUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonTestUtil() {
    }

    /**
     * Serialize any object to a JSON string for use in requests or assertions.
     */
    public static String toJson(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Deserialize a JSON string into a simple POJO.
     */
    public static <T> T fromJson(String json, Class<T> type) {
        try {
            return MAPPER.readValue(json, type);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

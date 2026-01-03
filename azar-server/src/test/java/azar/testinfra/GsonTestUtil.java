package azar.testinfra;

import java.lang.reflect.Type;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

/**
 * Tiny Gson-based JSON helpers for tests.
 * <p>
 * Why: Some teams prefer Gson in tests (or want to compare Gson vs Jackson behavior). This utility
 * provides a dedicated, configurable Gson instance for tests without affecting production code.
 */
public final class GsonTestUtil {
    private static final Gson GSON = new GsonBuilder()
            .disableHtmlEscaping()
            .serializeNulls()
            .create();

    private GsonTestUtil() {
    }

    /**
     * Serialize any object to a JSON string using Gson.
     */
    public static String toJson(Object value) {
        return GSON.toJson(value);
    }

    /**
     * Deserialize a JSON string into a simple POJO type.
     */
    public static <T> T fromJson(String json, Class<T> type) {
        try {
            return GSON.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Deserialize a JSON string into a generic type using TypeToken.
     */
    public static <T> T fromJson(String json, TypeToken<T> token) {
        Type type = token.getType();
        try {
            return GSON.fromJson(json, type);
        } catch (JsonSyntaxException e) {
            throw new RuntimeException(e);
        }
    }
}

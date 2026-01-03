package azar.testinfra;

import java.util.Iterator;
import java.util.Map;
import java.util.Objects;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.MissingNode;

/**
 * Small JSON assertion helpers using Jackson. No external libs required.
 * <p>
 * Focuses on practical needs:
 * - Structural equality ignoring field order in objects
 * - JSON Pointer path extraction and equality checks
 */
public final class JsonAssertUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonAssertUtil() {
    }

    /**
     * Parses string to JsonNode (throws RuntimeException on failure).
     */
    public static JsonNode parse(String json) {
        try {
            return MAPPER.readTree(json);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Asserts that two JSON payloads are structurally equal (order-insensitive for object fields).
     * Provides a readable diff path on first mismatch.
     */
    public static void assertJsonEquals(String expectedJson, String actualJson) {
        JsonNode expected = parse(expectedJson);
        JsonNode actual = parse(actualJson);
        String mismatch = firstMismatch(expected, actual, "$");
        if (mismatch != null) {
            throw new AssertionError("JSON mismatch at " + mismatch + "\nExpected: " + expected + "\nActual  : " + actual);
        }
    }

    /**
     * Extracts a value using a JSON Pointer (RFC 6901) and compares it to the expected string representation.
     * Example pointer: "/a/b/0". For root, use "/" or empty string.
     */
    public static void assertJsonPointerEquals(String json, String pointer, String expectedValue) {
        JsonNode node = parse(json).at(pointer == null || pointer.isEmpty() ? "/" : pointer);
        if (node instanceof MissingNode) {
            throw new AssertionError("JSON pointer not found: " + pointer);
        }
        String actual = node.isTextual() ? node.asText() : node.toString();
        if (!Objects.equals(expectedValue, actual)) {
            throw new AssertionError("JSON pointer " + pointer + " expected '" + expectedValue + "' but was '" + actual + "'");
        }
    }

    private static String firstMismatch(JsonNode expected, JsonNode actual, String path) {
        if (expected == null && actual == null) return null;
        if (expected == null || actual == null) return path + " (one is null)";
        if (expected.isObject() && actual.isObject()) {
            // Check that all expected fields exist and match
            Iterator<Map.Entry<String, JsonNode>> it = expected.fields();
            while (it.hasNext()) {
                Map.Entry<String, JsonNode> e = it.next();
                String field = e.getKey();
                JsonNode aChild = actual.get(field);
                if (aChild == null) return path + "." + field + " (missing field)";
                String mm = firstMismatch(e.getValue(), aChild, path + "." + field);
                if (mm != null) return mm;
            }
            // Ensure actual doesn't have unexpected extra fields
            Iterator<String> aFields = actual.fieldNames();
            while (aFields.hasNext()) {
                String f = aFields.next();
                if (!expected.has(f)) return path + "." + f + " (unexpected field)";
            }
            return null;
        } else if (expected.isArray() && actual.isArray()) {
            if (expected.size() != actual.size())
                return path + " (array size " + expected.size() + " != " + actual.size() + ")";
            for (int i = 0; i < expected.size(); i++) {
                String mm = firstMismatch(expected.get(i), actual.get(i), path + "[" + i + "]");
                if (mm != null) return mm;
            }
            return null;
        } else {
            if (Objects.equals(expected, actual)) return null;
            // For numbers/booleans/texts compare values reasonably
            if (expected.isNumber() && actual.isNumber()) {
                if (expected.decimalValue().compareTo(actual.decimalValue()) == 0) return null;
            } else if (expected.isTextual() && actual.isTextual()) {
                if (Objects.equals(expected.asText(), actual.asText())) return null;
            } else if (expected.isBoolean() && actual.isBoolean()) {
                if (expected.asBoolean() == actual.asBoolean()) return null;
            }
            return path + " (" + expected + " != " + actual + ")";
        }
    }
}

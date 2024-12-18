package azar.utils;
import java.lang.reflect.Field;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class Utilities
 **/
public class Utilities {

    public static boolean isNumber(String maybeNumber) {
        if (maybeNumber == null) {
            return false;
        }

        for (char c : maybeNumber.toCharArray()) {
            if (!Character.isDigit(c)) return false;
        }
        return true;
    }

    public static boolean isBoolean(String maybeBoolean) {
        return ("true".equals(maybeBoolean) || "false".equals(maybeBoolean));
    }

    public static String getHumanReadableSize(byte[] data) {
        if (data == null) {
            return "0 B";
        }
        long size = data.length;
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;

        double sizeInUnits = size;
        while (sizeInUnits >= 1024 && unitIndex < units.length - 1) {
            sizeInUnits /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", sizeInUnits, units[unitIndex]);
    }

    public static <T> void mergeNonNullFields(T source, T target) {
        if (source == null || target == null) return;

        try {
            for (Field field : source.getClass().getDeclaredFields()) {
                field.setAccessible(true);

                Object sourceValue = field.get(source);
                Object targetValue = field.get(target);

                // Skip null fields from source
                if (sourceValue == null) {
                    continue;
                }

                // Handle byte[] fields specifically
                if (sourceValue instanceof byte[] sourceBytes) {
                    byte[] targetBytes = (byte[]) targetValue;

                    // If source is an empty byte array, retain target's value
                    if (sourceBytes.length == 0 && targetBytes != null) {
                        continue; // Do not overwrite with an empty array
                    }
                }

                // Update the field if sourceValue is valid
                field.set(target, sourceValue);
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException("Failed to merge fields", e);
        }
    }
}

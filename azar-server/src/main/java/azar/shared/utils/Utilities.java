package azar.shared.utils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class Utilities {
    private static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

    private Utilities() {
    }

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

    public static byte[] generateThumbnail(byte[] pdfBytes) {
        try {
            Path tmpPdf = Files.createTempFile("thumb-", ".pdf");
            Files.write(tmpPdf, pdfBytes);

            Path out = Files.createTempFile("thumb-out-", "");
            // Render page 1 at 150 DPI to PNG
            Process p = new ProcessBuilder(
                    "pdftoppm", "-singlefile", "-f", "1", "-l", "1",
                    "-png", "-r", "150",
                    tmpPdf.toString(), out.toString()
            ).inheritIO().start();

            if (p.waitFor() != 0) return new byte[0];

            Path png = Path.of(out.toString() + ".png");
            byte[] bytes = Files.readAllBytes(png);

            Files.deleteIfExists(png);
            Files.deleteIfExists(tmpPdf);
            Files.deleteIfExists(out);
            return bytes;
        } catch (Exception e) {
            return new byte[0];
        }
    }


    public static boolean isValidEmail(String email) {
        return email != null && Pattern.matches(EMAIL_REGEX, email);
    }

    public static boolean isInteger(String maybeInteger) {
        try {
            Integer.parseInt(maybeInteger);
            return true;
        } catch (NumberFormatException ignored) {
        }
        return false;
    }
}

package azar.gallery.utils;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class Utilities {
    private static final Logger logger = LoggerFactory.getLogger(Utilities.class);

    private Utilities() {
    }

    public static byte[] generateThumbnail(byte[] imageBytes, int width, int height) {
        try {
            if (imageBytes == null || imageBytes.length == 0) {
                logger.error("Input image bytes are empty or null");
                return new byte[0];
            }

            ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);
            BufferedImage originalImage = ImageIO.read(inputStream);

            if (originalImage == null) {
                logger.error("Failed to decode input image");
                return new byte[0];
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(originalImage)
                    .size(width, height)
                    .outputQuality(1.0)
                    .outputFormat("png")
                    .toOutputStream(outputStream);

            return outputStream.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to generate thumbnail", e);
        }
        return new byte[0];
    }
}


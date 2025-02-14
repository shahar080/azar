package azar.gallery.utils;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import net.coobird.thumbnailator.Thumbnails;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
public class Utilities {

    public static Future<byte[]> generateThumbnail(byte[] imageBytes, int width, int height, Vertx vertx) {
        return Future.future(promise -> {
            vertx.executeBlocking(() -> {
                try {
                    if (imageBytes == null || imageBytes.length == 0) {
                        promise.fail("Input image bytes are empty or null");
                        return null;
                    }

                    ByteArrayInputStream inputStream = new ByteArrayInputStream(imageBytes);
                    BufferedImage originalImage = ImageIO.read(inputStream);

                    if (originalImage == null) {
                        promise.fail("Failed to decode input image");
                        return null;
                    }

                    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    Thumbnails.of(originalImage)
                            .size(width, height)
                            .outputQuality(1.0)
                            .outputFormat("png")
                            .toOutputStream(outputStream);

                    promise.complete(outputStream.toByteArray());
                } catch (Exception e) {
                    promise.fail(e);

                }
                return null;
            }, false);
        });
    }
}


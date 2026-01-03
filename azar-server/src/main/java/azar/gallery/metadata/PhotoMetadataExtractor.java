package azar.gallery.metadata;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.PhotoMetadata;
import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
@ApplicationScoped
public class PhotoMetadataExtractor {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    public PhotoMetadata extractMetadataFromBytes(byte[] data) {
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(data);) {
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
            return extract(metadata);
        } catch (Exception e) {
            logger.warn("Error creating metadata", e);
        }
        return new PhotoMetadata();
    }

    public PhotoMetadata extractMetadataFromFile(File file) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file);
            return extract(metadata);
        } catch (Exception e) {
            logger.warn("Error creating metadata", e);
        }
        return new PhotoMetadata();
    }

    private PhotoMetadata extract(Metadata metadata) {
        String imageHeight = extractValue(metadata, JpegDirectory.class, JpegDirectory.TAG_IMAGE_HEIGHT, "height", "");
        String imageWidth = extractValue(metadata, JpegDirectory.class, JpegDirectory.TAG_IMAGE_WIDTH, "width", "");
        String make = extractValue(metadata, ExifIFD0Directory.class, ExifIFD0Directory.TAG_MAKE, "make", "");
        String model = extractValue(metadata, ExifIFD0Directory.class, ExifIFD0Directory.TAG_MODEL, "model", "");
        String dateTime = extractValue(metadata, ExifIFD0Directory.class, ExifSubIFDDirectory.TAG_DATETIME, "dateTime", null);
        GpsMetadata gpsMetadata = new GpsMetadata();
        GpsDirectory gps = metadata.getFirstDirectoryOfType(GpsDirectory.class);
        if (gps != null) {
            String latitude = gps.getDescription(GpsDirectory.TAG_LATITUDE);
            if (latitude != null) {
                gpsMetadata.setLatitude(parseDMS(latitude));
            }
            String longitude = gps.getDescription(GpsDirectory.TAG_LONGITUDE);
            if (longitude != null) {
                gpsMetadata.setLongitude(parseDMS(longitude));
            }
            String altitude = gps.getDescription(GpsDirectory.TAG_ALTITUDE);
            if (altitude != null) {
                gpsMetadata.setAltitude(extractAltitude(altitude));
            }
        }
        Instant date = Instant.now();
        if (dateTime != null) {
            try {
                date = Instant.parse(dateTime);
            } catch (Exception ignored) {
                try {
                    date = LocalDateTime.parse(dateTime, DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss")).toInstant(ZoneOffset.UTC);
                } catch (Exception ignored2) {
                }
            }
        } else {
            date = Instant.now();
        }
        return PhotoMetadata.builder()
                .imageHeight(imageHeight)
                .imageWidth(imageWidth)
                .cameraMake(make)
                .cameraModel(model)
                .dateTaken(date)
                .gps(gpsMetadata)
                .build();
    }

    private String extractValue(Metadata metadata, Class<? extends Directory> clazz, int tag, String label, String defaultValue) {
        String res = defaultValue;
        try {
            res = metadata.getFirstDirectoryOfType(clazz).getDescription(tag);
        } catch (Exception e) {
            logger.warn("Could not get image {} due to {}", label, e.getMessage());
        }
        return res;
    }

    private Double parseDMS(String dms) {
        try {
            Pattern pattern = Pattern.compile("(\\d+)°\\s*(\\d+)'\\s*([\\d.]+)\"");
            Matcher matcher = pattern.matcher(dms);

            if (matcher.find()) {
                int degrees = Integer.parseInt(matcher.group(1));
                int minutes = Integer.parseInt(matcher.group(2));
                double seconds = Double.parseDouble(matcher.group(3));

                return degrees + (minutes / 60.0) + (seconds / 3600.0);
            } else {
                logger.warn("Invalid DMS format for {}, setting default.. ", dms);
            }
        } catch (Exception e) {
            logger.warn("Error parsing DMS coordinate: {}", dms, e);
        }
        return 0.0;
    }

    public Double extractAltitude(String text) {
        Pattern pattern = Pattern.compile("-?\\d+(\\.\\d+)?");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return Double.parseDouble(matcher.group());
        }
        return 0.0;
    }

}

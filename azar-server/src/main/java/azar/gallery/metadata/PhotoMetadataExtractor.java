package azar.gallery.metadata;

import azar.gallery.entities.db.GpsMetadata;
import azar.gallery.entities.db.PhotoMetadata;
import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Author: Shahar Azar
 * Date:   11/02/2025
 **/
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
        String imageHeight = metadata.getFirstDirectoryOfType(JpegDirectory.class).getDescription(JpegDirectory.TAG_IMAGE_HEIGHT);
        String imageWidth = metadata.getFirstDirectoryOfType(JpegDirectory.class).getDescription(JpegDirectory.TAG_IMAGE_WIDTH);
        String make = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class).getDescription(ExifIFD0Directory.TAG_MAKE);
        String model = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class).getDescription(ExifIFD0Directory.TAG_MODEL);
        String dateTime = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class).getDescription(ExifSubIFDDirectory.TAG_DATETIME);

        GpsMetadata gpsMetadata = new GpsMetadata();
        GpsDirectory gps = metadata.getFirstDirectoryOfType(GpsDirectory.class);
        if (gps != null) {
            // TODO: 11/02/2025 AZAR-134 Test with gps photo
            String latitude = gps.getDescription(GpsDirectory.TAG_LATITUDE);
            if (latitude != null) {
                gpsMetadata.setLatitude(Double.valueOf(latitude));
            }
            String longitude = gps.getDescription(GpsDirectory.TAG_LONGITUDE);
            if (longitude != null) {
                gpsMetadata.setLongitude(Double.valueOf(longitude));
            }
            String altitude = gps.getDescription(GpsDirectory.TAG_ALTITUDE);
            if (altitude != null) {
                gpsMetadata.setAltitude(Double.valueOf(altitude));
            }
        }
        LocalDateTime localDateTime = LocalDateTime.now();
        if (dateTime != null) {
            localDateTime = LocalDateTime.parse(dateTime, DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss"));
        }
        return PhotoMetadata.builder()
                .imageHeight(imageHeight)
                .imageWidth(imageWidth)
                .cameraMake(make)
                .cameraModel(model)
                .dateTaken(localDateTime.toInstant(ZoneOffset.UTC))
                .gps(gpsMetadata)
                .build();
    }
}

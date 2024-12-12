package azar.properties;

import azar.utils.Utilities;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 * Purpose: //TODO add purpose for class AppProperties
 **/

public class AppProperties {
    private final static String PROPERTIES_FILE_NAME = "app.properties"; // TODO: 12/12/2024 SHAHAR-8 get from env, if not exists, use default

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final Properties properties;

    public AppProperties() {
        properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(PROPERTIES_FILE_NAME)) {
            if (input == null) {
                throw new IllegalArgumentException("Unable to find " + PROPERTIES_FILE_NAME);
            }
            properties.load(input);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to load properties file: " + PROPERTIES_FILE_NAME, ex);
        }
    }

    public String getProperty(String key) {
        return getProperty(key, null, false);
    }

    public String getProperty(String key, String defaultValue) {
        return getProperty(key, defaultValue, true);
    }

    private String getProperty(String key, String defaultValue, boolean useDefaultValue) {
        String propertyValue = properties.getProperty(key);
        if (propertyValue == null) {
            if (useDefaultValue) {
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
                throw new RuntimeException(); // TODO: 12/12/2024 SHAHAR-11
            }
        }
        return propertyValue;
    }

    public int getIntProperty(String key) {
        return getIntProperty(key, -1, false);
    }

    public int getIntProperty(String key, int defaultValue) {
        return getIntProperty(key, defaultValue, true);
    }

    private int getIntProperty(String key, int defaultValue, boolean useDefaultValue) {
        String propertyValue = properties.getProperty(key);
        if (!Utilities.isNumber(propertyValue)) {
            if (useDefaultValue) {
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
                throw new RuntimeException(); // TODO: 12/12/2024 SHAHAR-11
            }
        }
        return Integer.parseInt(propertyValue);
    }

    public boolean getBooleanProperty(String key) {
        return getBooleanProperty(key, false, false);
    }

    public boolean getBooleanProperty(String key, boolean defaultValue) {
        return getBooleanProperty(key, defaultValue, true);
    }

    private boolean getBooleanProperty(String key, boolean defaultValue, boolean useDefaultValue) {
        String propertyValue = properties.getProperty(key);
        if (!Utilities.isBoolean(propertyValue)) {
            if (useDefaultValue) {
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
                throw new RuntimeException(); // TODO: 12/12/2024 SHAHAR-11
            }
        }
        return Boolean.parseBoolean(propertyValue);
    }
}

package azar.shared.properties;

import azar.shared.utils.Utilities;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Properties;

import static azar.cloud.utils.Constants.DEFAULT_APP_PROPERTIES_FILE_PATH;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/

public class AppProperties {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final Properties properties;

    public AppProperties() {
        properties = new Properties();
        loadEnvironmentVariables();
        loadPropertiesFromFile();
    }

    // Load environment variables and override the properties if set
    private void loadEnvironmentVariables() {
        // Iterate through system environment variables and override matching properties
        for (String key : System.getenv().keySet()) {
            String envValue = System.getenv(key);
            if (envValue != null) {
                properties.setProperty(key, envValue);
            }
        }
    }

    private void loadPropertiesFromFile() {
        String propertiesFileName = properties.getProperty("PROPERTIES_FILE_NAME", DEFAULT_APP_PROPERTIES_FILE_PATH);
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(propertiesFileName)) {
            if (input == null) {
                throw new IllegalArgumentException("Unable to find " + propertiesFileName);
            }
            properties.load(input);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to load properties file: " + propertiesFileName, ex);
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
                logWarnDefaultValue(key, defaultValue);
                return defaultValue;
            } else {
                logErrorNotFound(key);
                throw new RuntimeException();
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
                logWarnDefaultValue(key, defaultValue);
                return defaultValue;
            } else {
                logErrorNotFound(key);
                throw new RuntimeException();
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
                logWarnDefaultValue(key, defaultValue);
                return defaultValue;
            } else {
                logErrorNotFound(key);
                throw new RuntimeException();
            }
        }
        return Boolean.parseBoolean(propertyValue);
    }

    public List<String> getListProperty(String key) {
        return getListProperty(key, null, false);
    }

    public List<String> getListProperty(String key, List<String> defaultValue) {
        return getListProperty(key, defaultValue, true);
    }

    private List<String> getListProperty(String key, List<String> defaultValue, boolean useDefaultValue) {
        String propertyValue = properties.getProperty(key);
        if (propertyValue == null) {
            if (useDefaultValue) {
                logWarnDefaultValue(key, defaultValue);
                return defaultValue != null ? defaultValue : Collections.emptyList();
            } else {
                logErrorNotFound(key);
                throw new RuntimeException(key + " not found in properties file");
            }
        }
        return Arrays.asList(propertyValue.split(","));
    }


    private void logWarnDefaultValue(String key, Object defaultValue) {
        logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
    }

    private void logErrorNotFound(String key) {
        logger.error("{} not found in properties file", key);
    }
}

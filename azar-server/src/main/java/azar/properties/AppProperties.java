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
        String propertiesFileName = properties.getProperty("PROPERTIES_FILE_NAME", "app.properties");
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
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
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
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
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
                logger.warn("{} not found in properties file, using default value {}", key, defaultValue);
                return defaultValue;
            } else {
                logger.error("{} not found in properties file", key);
                throw new RuntimeException();
            }
        }
        return Boolean.parseBoolean(propertyValue);
    }
}

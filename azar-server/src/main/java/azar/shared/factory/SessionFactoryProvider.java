package azar.shared.factory;

import azar.shared.properties.AppProperties;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import lombok.Getter;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

/**
 * Author: Shahar Azar
 * Date:   22/12/2024
 **/
@Getter
@Singleton
public class SessionFactoryProvider {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final SessionFactory sessionFactory;

    @Inject
    public SessionFactoryProvider(AppProperties appProperties) {
        String hibernateConfigFilePath = appProperties.getProperty("HIBERNATE_CFG_FILE_PATH", "/data/azar/server/hibernate.cfg.xml");

        try {
            File configFile = new File(hibernateConfigFilePath);
            Configuration configuration = new Configuration();
            configuration.configure(configFile);
            this.sessionFactory = configuration.buildSessionFactory();
            logger.info("Hibernate SessionFactory initialized successfully.");
        } catch (Exception ex) {
            throw new RuntimeException("Failed to load Hibernate configuration from " + hibernateConfigFilePath, ex);
        }
    }

}

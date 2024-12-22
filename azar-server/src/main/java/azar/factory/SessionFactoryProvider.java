package azar.factory;

import com.google.inject.Singleton;
import lombok.Getter;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

/**
 * Author: Shahar Azar
 * Date:   22/12/2024
 **/
@Getter
@Singleton
public class SessionFactoryProvider {
    private final SessionFactory sessionFactory;

    public SessionFactoryProvider() {
        this.sessionFactory = new Configuration().configure().buildSessionFactory();
    }

}

package azar.whoami.dal.service;

import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.WhoAmIDao;
import azar.whoami.entities.db.WhoAmIData;
import jakarta.enterprise.context.ApplicationScoped;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@ApplicationScoped
public class WhoAmIService extends GenericService<WhoAmIData> {

    private final WhoAmIDao whoAmIDao;

    public WhoAmIService(WhoAmIDao whoAmIDao) {
        this.whoAmIDao = whoAmIDao;
    }

    @Override
    protected GenericDao<WhoAmIData> getDao() {
        return whoAmIDao;
    }
}

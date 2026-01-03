package azar.whoami.dal.service;

import java.io.IOException;
import java.io.InputStream;
import static azar.cloud.utils.Constants.DEFAULT_CV_FILE_PATH;
import azar.shared.dal.dao.GenericDao;
import azar.shared.dal.service.GenericService;
import azar.whoami.dal.dao.CVDao;
import azar.whoami.entities.db.CV;
import jakarta.enterprise.context.ApplicationScoped;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@ApplicationScoped
public class CVService extends GenericService<CV> {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final CVDao cvDao;

    public CVService(CVDao cvDao) {
        this.cvDao = cvDao;
    }

    @Override
    protected GenericDao<CV> getDao() {
        return cvDao;
    }

    public CV getDefault() {
        CV cv = new CV();
        cv.setFileName(DEFAULT_CV_FILE_PATH);
        cv.setData(getFileContent(DEFAULT_CV_FILE_PATH));
        return cv;
    }

    protected byte[] getFileContent(String fileName) {
        byte[] fileContent = new byte[0];
        try (InputStream inputStream = getClass().getClassLoader()
                .getResourceAsStream(fileName)) {
            if (inputStream == null) {
                return fileContent;
            }

            fileContent = inputStream.readAllBytes();
        } catch (IOException e) {
            logger.error("Error reading file {}", fileName, e);
        }
        return fileContent;
    }
}

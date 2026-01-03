package azar.whoami.resources;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import static azar.cloud.utils.Constants.ADMIN_GROUP;
import static azar.cloud.utils.Constants.ADMIN_PREFIX_STRING;
import static azar.cloud.utils.Constants.DEFAULT_PHOTO_1_FILE_PATH;
import static azar.cloud.utils.Constants.DEFAULT_PHOTO_2_FILE_PATH;
import static azar.cloud.utils.Constants.DEFAULT_PHOTO_3_FILE_PATH;
import azar.shared.resources.BaseResource;
import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import azar.whoami.entities.requests.UpdateWhoAmIDataRequest;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Path("/api/wai/whoami")
public class WhoAmIResource extends BaseResource {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final WhoAmIService whoAmIService;

    public WhoAmIResource(WhoAmIService whoAmIService) {
        this.whoAmIService = whoAmIService;
    }

    @Path("/get")
    @GET
    @Transactional(Transactional.TxType.SUPPORTS)
    @PermitAll
    public Response getWhoAmI() {
        WhoAmIData whoAmIData = whoAmIService.getFirst();
        if (whoAmIData == null) {
            logger.warn("Could not get WhoAmI data from db, returning default value..");
            return ok(getDefaultData(), "Sent DEFAULT WhoAmIData back to client");
        }
        return ok(whoAmIData, "Sent WhoAmIData back to client");
    }

    @Path(ADMIN_PREFIX_STRING + "/update")
    @POST
    @Transactional
    @RolesAllowed(ADMIN_GROUP)
    public Response updateWhoAmI(UpdateWhoAmIDataRequest updateWhoAmIDataRequest) {
        Optional<WhoAmIData> optionalWhoAmIData = Optional.ofNullable(whoAmIService.getFirst());
        WhoAmIData whoAmIData = optionalWhoAmIData.orElse(new WhoAmIData());
        WhoAmIData clientWhoAmIData = updateWhoAmIDataRequest.getWhoAmIData();
        whoAmIData.setHeaderTitle(clientWhoAmIData.getHeaderTitle());
        whoAmIData.setHeaderIntro(clientWhoAmIData.getHeaderIntro());
        whoAmIData.setMainContentQuestion(clientWhoAmIData.getMainContentQuestion());
        whoAmIData.setMainContentFirstTitle(clientWhoAmIData.getMainContentFirstTitle());
        whoAmIData.setMainContentFirstData(clientWhoAmIData.getMainContentFirstData());
        whoAmIData.setMainContentSecondTitle(clientWhoAmIData.getMainContentSecondTitle());
        whoAmIData.setMainContentSecondData(clientWhoAmIData.getMainContentSecondData());
        whoAmIData.setCvButton(clientWhoAmIData.getCvButton());

        List<String> photos = clientWhoAmIData.getPhotos();
        try {
            if (photos != null) {
                photos.forEach(photo -> Base64.getDecoder().decode(photo));
            }
        } catch (IllegalArgumentException e) {
            return badRequest("Invalid Base64 photo supplied");
        }
        whoAmIData.setPhotos(photos);

        WhoAmIData whoAmIData1 = whoAmIService.merge(whoAmIData);
        if (whoAmIData1 != null) {
            return ok("Successfully updated WhoAmI data", "Successfully updated WhoAmI data");
        } else {
            return internalError("Error while updating WhoAmIData");
        }
    }

    private WhoAmIData getDefaultData() {
        WhoAmIData whoAmIData = new WhoAmIData();
        whoAmIData.setHeaderTitle("Shahar Azar");
        whoAmIData.setHeaderIntro("Let me tell you about myself..");
        whoAmIData.setMainContentQuestion("So.. Who am I?");
        whoAmIData.setMainContentFirstTitle("With over 6 years of experience in software engineering, I specialize in backend development and solving complex challenges with innovative and efficient solutions.");
        List<String> mainContentFirstData = new ArrayList<>();
        mainContentFirstData.add("Proficient in Java 9+, Python, Vert.x, Spring, Hibernate, SQL, and Docker.");
        mainContentFirstData.add("Experienced with cloud-native technologies, CI/CD pipelines, and databases like PostgreSQL and MongoDB.");
        whoAmIData.setMainContentFirstData(mainContentFirstData);
        whoAmIData.setMainContentSecondTitle("A few key notes about me:");
        List<String> mainContentSecondData = new ArrayList<>();
        mainContentSecondData.add("√ Problem Solver: Optimized performance in critical systems, enhancing efficiency and scalability.");
        mainContentSecondData.add("√ Mentor & Leader: Guided teams on best practices, fostering growth and knowledge sharing.");
        mainContentSecondData.add("√ Innovator: Delivered impactful solutions, including stateless microservices and custom infrastructure improvements.");
        whoAmIData.setMainContentSecondData(mainContentSecondData);
        whoAmIData.setCvButton("→ Learn more ←");
        List<String> photos = new ArrayList<>();
        byte[] fileContent = getFileContent(DEFAULT_PHOTO_1_FILE_PATH);
        photos.add(Base64.getEncoder().encodeToString(fileContent));
        fileContent = getFileContent(DEFAULT_PHOTO_2_FILE_PATH);
        photos.add(Base64.getEncoder().encodeToString(fileContent));
        fileContent = getFileContent(DEFAULT_PHOTO_3_FILE_PATH);
        photos.add(Base64.getEncoder().encodeToString(fileContent));
        whoAmIData.setPhotos(photos);
        return whoAmIData;
    }

}

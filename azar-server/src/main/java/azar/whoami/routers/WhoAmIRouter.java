package azar.whoami.routers;

import azar.shared.dal.service.UserService;
import azar.shared.routers.BaseRouter;
import azar.shared.utils.JsonManager;
import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import azar.whoami.entities.requests.UpdateWhoAmIDataRequest;
import com.google.inject.Inject;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import static azar.cloud.utils.Constants.*;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
public class WhoAmIRouter extends BaseRouter {
    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final JsonManager jsonManager;
    private final WhoAmIService whoAmIService;
    private final UserService userService;

    @Inject
    public WhoAmIRouter(JsonManager jsonManager, WhoAmIService whoAmIService, UserService userService) {
        this.jsonManager = jsonManager;
        this.whoAmIService = whoAmIService;
        this.userService = userService;
    }

    public Router create(Vertx vertx) {
        Router cvRouter = Router.router(vertx);

        cvRouter.get("/get").handler(this::handleGet);
        cvRouter.post(OPS_PREFIX_STRING + "/update").handler(this::handleUpdate);

        return cvRouter;
    }

    private void handleGet(RoutingContext routingContext) {
        whoAmIService.getWhoAmIFromDB()
                .onSuccess(optionalWhoAmIData -> {
                    if (optionalWhoAmIData.isEmpty()) {
                        logger.warn("Could not get WhoAmI data from db, returning default value..");
                        sendOKResponse(routingContext, jsonManager.toJson(getDefaultData()), "Sent DEFAULT WhoAmIData back to client");
                        return;
                    }
                    sendOKResponse(routingContext, jsonManager.toJson(optionalWhoAmIData.get()), "Sent WhoAmIData back to client");
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error getting WhoAmI data, error: %s".formatted(err.getMessage())));
    }

    private void handleUpdate(RoutingContext routingContext) {
        UpdateWhoAmIDataRequest updateWhoAmIDataRequest = jsonManager.fromJson(routingContext.body().asString(), UpdateWhoAmIDataRequest.class);
        String currentUser = updateWhoAmIDataRequest.getCurrentUser();
        if (isInvalidUsername(routingContext, currentUser)) return;

        userService.isAdmin(updateWhoAmIDataRequest.getCurrentUser())
                .onSuccess(isAdmin -> {
                    if (!isAdmin) {
                        sendUnauthorizedErrorResponse(routingContext, "User %s is not authorized to add users!".formatted(updateWhoAmIDataRequest.getCurrentUser()));
                        return;
                    }
                    whoAmIService.getWhoAmIFromDB()
                            .onSuccess(optionalWhoAmIData -> {
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
                                photos.forEach(photo -> Base64.getDecoder().decode(photo));
                                whoAmIData.setPhotos(photos);

                                whoAmIService.update(whoAmIData)
                                        .onSuccess(_ -> sendOKResponse(routingContext, "Successfully updated WhoAmI data", "User %s updated WhoAmIData".formatted(currentUser)))
                                        .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating WhoAmIData, error: %s".formatted(err.getMessage())));
                            })
                            .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating WhoAmIData, error: %s".formatted(err.getMessage())));
                })
                .onFailure(err -> sendInternalErrorResponse(routingContext, "Error while updating WhoAmIData, error: %s".formatted(err.getMessage())));
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

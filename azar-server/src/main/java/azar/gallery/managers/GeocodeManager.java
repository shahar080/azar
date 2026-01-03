package azar.gallery.managers;

import java.util.List;
import azar.gallery.entities.external.mapbox.api.LatLong;
import azar.gallery.entities.external.mapbox.api.MBData;
import static azar.gallery.utils.Constants.REVERSE_GEOCODE_BATCH_BASE_URL;
import static azar.gallery.utils.Constants.REVERSE_GEOCODE_SINGLE_BASE_URL;
import azar.shared.properties.AppProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
@ApplicationScoped
public class GeocodeManager {
    private final Client client;
    private final String apiKey;
    private final Logger logger;

    public GeocodeManager(AppProperties appProperties, Logger logger) {
        this.apiKey = appProperties.getMapBoxApiKey();
        this.client = ClientBuilder.newClient();
        this.logger = logger;
    }

    public MBData reverseGeocode(Double latitude, Double longitude) {
        Response response = client
                .target(REVERSE_GEOCODE_SINGLE_BASE_URL)
                .queryParam("latitude", String.valueOf(latitude))
                .queryParam("longitude", String.valueOf(longitude))
                .queryParam("access_token", apiKey)
                .queryParam("language", "en")
                .queryParam("types", "place,region,country")
                .request().get();

        return response.readEntity(MBData.class);
    }

    public List<MBData> reverseGeocodeBatch(List<LatLong> latLongs) {
        JsonArray requestBody = new JsonArray();
        latLongs.forEach(latLong -> {
            JsonObject location = new JsonObject()
                    .put("longitude", latLong.getLongitude())
                    .put("latitude", latLong.getLatitude())
                    .put("language", "en")
                    .put("types", new JsonArray().add("place").add("region").add("country"));
            requestBody.add(location);
        });

        try (Response response = client
                .target(REVERSE_GEOCODE_BATCH_BASE_URL)
                .queryParam("access_token", apiKey)
                .request()
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .post(Entity.json(requestBody.encode()))) {

            JsonObject json = response.readEntity(JsonObject.class);
            JsonArray batch = json.getJsonArray("batch");
            ObjectMapper mapper = new ObjectMapper();

            return batch.stream()
                    .map(JsonObject.class::cast)
                    .map(val -> {
                        try {
                            return mapper.readValue(val.toString(), MBData.class);
                        } catch (Exception e) {
                            logger.warn("Failed to parse MBData", e);
                        }
                        return null;
                    })
                    .toList();
        }
    }

}

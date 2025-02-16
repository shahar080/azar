package azar.gallery.managers;

import azar.gallery.entities.external.mapbox.api.LatLong;
import azar.gallery.entities.external.mapbox.api.MBData;
import azar.shared.properties.AppProperties;
import azar.shared.utils.JsonManager;
import com.google.common.reflect.TypeToken;
import com.google.inject.Inject;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;

import java.lang.reflect.Type;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   16/02/2025
 **/
public class GeocodeManager {
    private final WebClient webClient;
    private final Vertx vertx;
    private final JsonManager jsonManager;

    private final String apiKey;

    private final String reverseGeocodeSingleBaseUrl = "https://api.mapbox.com/search/geocode/v6/reverse";
    private final String reverseGeocodeBatchBaseUrl = "https://api.mapbox.com/search/geocode/v6/batch";

    @Inject
    public GeocodeManager(Vertx vertx, JsonManager jsonManager, AppProperties appProperties) {
        this.vertx = vertx;
        this.webClient = WebClient.create(vertx);
        this.jsonManager = jsonManager;
//        this.apiKey = appProperties.getProperty("OPEN_WEATHER_MAP_API_KEY");
        this.apiKey = "pk.eyJ1Ijoic2hhaGFyYXphciIsImEiOiJjbTc3M2Q3cWwwZXJkMmpweXZucjI1bXIyIn0.nd4HOp0uOgcSNU5E0SukBg";
    }

    public Future<MBData> reverseGeocode(Double latitude, Double longitude) {
        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    webClient.getAbs(reverseGeocodeSingleBaseUrl)
                            .addQueryParam("latitude", String.valueOf(latitude))
                            .addQueryParam("longitude", String.valueOf(longitude))
                            .addQueryParam("access_token", apiKey)
                            .addQueryParam("language", "en")
                            .addQueryParam("types", "place,region,country")
                            .send()
                            .onSuccess(bufferHttpResponse -> {
                                if (bufferHttpResponse.statusCode() == 200) {
                                    String response = bufferHttpResponse.bodyAsString();
                                    getValuePromise.complete(jsonManager.fromJson(response, MBData.class));
                                } else {
                                    getValuePromise.fail(bufferHttpResponse.statusMessage());
                                }
                            })
                            .onFailure(getValuePromise::fail);
                    return null;
                }, false));
    }

    public Future<List<MBData>> reverseGeocodeBatch(List<LatLong> latLongs) {
        JsonArray requestBody = new JsonArray();
        latLongs.forEach(latLong -> {
            JsonObject location = new JsonObject()
                    .put("longitude", latLong.getLongitude())
                    .put("latitude", latLong.getLatitude())
                    .put("language", "en")
                    .put("types", new JsonArray().add("place,region,country"));
            requestBody.add(location);
        });

        return Future.future(getValuePromise ->
                vertx.executeBlocking(() -> {
                    webClient.postAbs(reverseGeocodeBatchBaseUrl)
                            .addQueryParam("access_token", apiKey)
                            .putHeader("Content-Type", "application/json")
                            .putHeader("Accept", "application/json")
                            .as(BodyCodec.jsonObject())
                            .sendJson(requestBody)
                            .onSuccess(bufferHttpResponse -> {
                                if (bufferHttpResponse.statusCode() == 200) {
                                    String response = bufferHttpResponse.body().getJsonArray("batch").encode();
                                    Type listType = new TypeToken<List<MBData>>() {
                                    }.getType();
                                    getValuePromise.complete(jsonManager.fromJson(response, listType));
                                } else {
                                    getValuePromise.fail(bufferHttpResponse.statusMessage());
                                }
                            })
                            .onFailure(getValuePromise::fail);
                    return null;
                }, false));
    }

}

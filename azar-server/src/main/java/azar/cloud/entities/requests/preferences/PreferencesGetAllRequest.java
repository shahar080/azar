package azar.cloud.entities.requests.preferences;

import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   02/01/2025
 **/
@Getter
@AllArgsConstructor
public class PreferencesGetAllRequest extends BaseRequest {
    private final String userId;
}

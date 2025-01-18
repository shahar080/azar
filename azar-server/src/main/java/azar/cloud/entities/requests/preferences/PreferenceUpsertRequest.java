package azar.cloud.entities.requests.preferences;

import azar.cloud.entities.db.Preference;
import azar.cloud.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   02/01/2025
 **/
@Getter
@AllArgsConstructor
public class PreferenceUpsertRequest extends BaseRequest {
    private final Preference preference;
}

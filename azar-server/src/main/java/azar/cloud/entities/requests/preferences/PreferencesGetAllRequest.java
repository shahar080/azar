package azar.cloud.entities.requests.preferences;

import azar.shared.entities.requests.BaseRequest;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   02/01/2025
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class PreferencesGetAllRequest extends BaseRequest {
    private Integer userId;
}

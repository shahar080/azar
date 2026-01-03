package azar.cloud.entities.requests.preferences;

import azar.shared.entities.requests.BaseRequest;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class SetFileMaxSizeRequest extends BaseRequest {
    private String maxFileSize;
}

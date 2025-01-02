package azar.entities.requests.preferences;

import azar.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   29/12/2024
 **/
@Getter
@AllArgsConstructor
public class SetFileMaxSizeRequest extends BaseRequest {
    private final String maxFileSize;
}

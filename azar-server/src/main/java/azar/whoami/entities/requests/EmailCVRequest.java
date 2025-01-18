package azar.whoami.entities.requests;

import azar.shared.entities.requests.EmptyBaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class EmailCVRequest extends EmptyBaseRequest {
    private String email;
}

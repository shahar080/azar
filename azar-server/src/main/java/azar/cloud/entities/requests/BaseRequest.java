package azar.cloud.entities.requests;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   24/12/2024
 **/
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BaseRequest {
    private String currentUser;
}

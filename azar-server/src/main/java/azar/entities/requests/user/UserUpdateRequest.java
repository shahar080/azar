package azar.entities.requests.user;

import azar.entities.db.User;
import azar.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   24/12/2024
 **/
@Getter
@AllArgsConstructor
public class UserUpdateRequest extends BaseRequest {
    private User user;
}

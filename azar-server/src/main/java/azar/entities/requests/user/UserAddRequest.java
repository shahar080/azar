package azar.entities.requests.user;

import azar.entities.db.User;
import azar.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
@Getter
@AllArgsConstructor
public class UserAddRequest extends BaseRequest {
    private User userToAdd;
}

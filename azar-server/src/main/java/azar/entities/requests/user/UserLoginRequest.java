package azar.entities.requests.user;

import azar.entities.db.UserNameAndPassword;
import azar.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   24/12/2024
 **/
@Getter
@AllArgsConstructor
public class UserLoginRequest extends BaseRequest {
    private UserNameAndPassword userNameAndPassword;
}

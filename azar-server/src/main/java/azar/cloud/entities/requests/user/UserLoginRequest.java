package azar.cloud.entities.requests.user;

import azar.cloud.entities.db.UserNameAndPassword;
import azar.shared.entities.requests.BaseRequest;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   24/12/2024
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
@RegisterForReflection
public class UserLoginRequest extends BaseRequest {
    private UserNameAndPassword userNameAndPassword;
}

package azar.cloud.entities.requests.user;

import azar.shared.entities.db.User;
import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   14/12/2024
 **/
@Getter
@AllArgsConstructor
public class UserUpsertRequest extends BaseRequest {
    private User user;
}

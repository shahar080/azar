package azar.whoami.entities.requests;

import azar.shared.entities.requests.BaseRequest;
import azar.whoami.entities.db.WhoAmIData;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWhoAmIDataRequest extends BaseRequest {
    private WhoAmIData whoAmIData;
}

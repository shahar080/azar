package azar.whoami.entities.requests;

import azar.shared.entities.requests.BaseRequest;
import azar.whoami.entities.db.EmailData;
import azar.whoami.entities.db.WhoAmIData;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   19/01/2025
 **/
@Getter
@AllArgsConstructor
public class UpdateEmailDataRequest extends BaseRequest {
    private EmailData emailData;
}

package azar.cloud.entities.requests.pdf;

import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PdfDeleteRequest extends BaseRequest {
    private String userName;
}

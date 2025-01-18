package azar.cloud.entities.requests.pdf;

import azar.cloud.entities.db.PdfFile;
import azar.shared.entities.requests.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Author: Shahar Azar
 * Date:   24/12/2024
 **/
@Getter
@AllArgsConstructor
public class PdfUpdateRequest extends BaseRequest {
    private PdfFile pdfFile;
}

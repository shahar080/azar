package azar.cloud.entities.requests.pdf;

import azar.cloud.entities.db.PdfFile;
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
public class PdfUpdateRequest extends BaseRequest {
    private PdfFile pdfFile;
}

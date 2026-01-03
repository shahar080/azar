package azar.cloud.entities.client;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 **/
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PdfFile {
    private Long id;
    private String uploadedBy;
    private String fileName;
    private String contentType;
    private List<String> labels;
    private String size;
    private Instant uploadedAt;
    private String description;
}

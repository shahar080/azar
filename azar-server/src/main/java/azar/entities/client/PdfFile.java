package azar.entities.client;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 * Purpose: //TODO add purpose for class PdfFile
 **/
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PdfFile {
    private Long id;
    private String fileName;
    private String contentType;
    private List<String> labels;
    private String size;
    private Instant uploadedAt;
    private String description;
}

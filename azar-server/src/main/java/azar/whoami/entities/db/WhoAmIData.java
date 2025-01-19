package azar.whoami.entities.db;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Author: Shahar Azar
 * Date:   18/01/2025
 **/
@Entity
@Table(name = "who_am_i")
@Getter
@Setter
public class WhoAmIData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "header_title", nullable = false)
    private String headerTitle;

    @Column(name = "header_into", nullable = false)
    private String headerIntro;

    @Column(name = "main_content_question", nullable = false)
    private String mainContentQuestion;

    @Column(name = "main_content_first_title", nullable = false)
    private String mainContentFirstTitle;

    @Column(name = "main_content_first_data", nullable = false)
    private List<String> mainContentFirstData;

    @Column(name = "main_content_second_title", nullable = false)
    private String mainContentSecondTitle;

    @Column(name = "main_content_second_data", nullable = false)
    private List<String> mainContentSecondData;

    @Column(name = "cv_button", nullable = false)
    private String cvButton;

    @Column(name = "photos", columnDefinition = "text[]")
    private List<String> photos = new ArrayList<>();
}

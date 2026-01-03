package azar.testinfra;

import java.util.List;
import azar.whoami.entities.db.WhoAmIData;

/**
 * Central place for creating sample test data objects.
 * <p>
 * Benefits:
 * - Keeps test fixtures consistent across the codebase.
 * - Reduces duplication in tests and makes intent clearer.
 */
public final class TestDataFactory {
    private TestDataFactory() {
    }

    /**
     * Provides a fully populated, valid WhoAmIData instance suitable for most tests.
     * Individual tests can clone/modify as needed to fit specific scenarios.
     */
    public static WhoAmIData sampleWhoAmIData() {
        WhoAmIData d = new WhoAmIData();
        d.setHeaderTitle("Header Title");
        d.setHeaderIntro("Intro");
        d.setMainContentQuestion("Question?");
        d.setMainContentFirstTitle("First Title");
        d.setMainContentFirstData(List.of("A", "B"));
        d.setMainContentSecondTitle("Second Title");
        d.setMainContentSecondData(List.of("C", "D"));
        d.setCvButton("Download");
        d.setPhotos(List.of());
        return d;
    }
}

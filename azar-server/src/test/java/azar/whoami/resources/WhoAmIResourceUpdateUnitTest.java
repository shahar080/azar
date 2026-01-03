package azar.whoami.resources;

import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import azar.testinfra.BaseUnitTest;
import azar.testinfra.RandomTestData;
import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import azar.whoami.entities.requests.UpdateWhoAmIDataRequest;
import jakarta.ws.rs.core.Response;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WhoAmIResourceUpdateUnitTest extends BaseUnitTest {

    @Mock
    WhoAmIService whoAmIService;
    @InjectMocks
    WhoAmIResource resource;

    @Test
    void updateWhoAmI_createsOrUpdates_andValidatesPhotos() {
        when(whoAmIService.getFirst()).thenReturn(null);
        when(whoAmIService.merge(any())).thenAnswer(inv -> inv.getArgument(0));

        String seededTitle;
        String introAtT0;
        String questionAtT5;
        try (var ignored = withTemporarySystemProperty("TEST_RANDOM_SEED", "123456")) {
            WhoAmIData client = new WhoAmIData();
            // Use deterministic helpers from BaseUnitTest in a real test
            seededTitle = RandomTestData.string(8);
            client.setHeaderTitle(seededTitle);
            introAtT0 = Instant.now(fixedClock).toString();
            client.setHeaderIntro(introAtT0);
            advanceClock(Duration.ofMinutes(5));
            questionAtT5 = Instant.now(fixedClock).toString();
            client.setMainContentQuestion(questionAtT5);
            client.setMainContentFirstTitle("FT");
            client.setMainContentFirstData(List.of("A"));
            client.setMainContentSecondTitle("ST");
            client.setMainContentSecondData(List.of("B"));
            client.setCvButton("CV");
            client.setPhotos(List.of(Base64.getEncoder().encodeToString("x".getBytes())));

            UpdateWhoAmIDataRequest req = new UpdateWhoAmIDataRequest(client);

            azar.testinfra.ResourceTestUtil.injectMockRoutingContext(resource, "/api/wai/whoami/admin/update");
            Response response = resource.updateWhoAmI(req);
            assertThat(response.getStatus()).isEqualTo(200);
        }

        ArgumentCaptor<WhoAmIData> captor = ArgumentCaptor.forClass(WhoAmIData.class);
        verify(whoAmIService).merge(captor.capture());
        WhoAmIData merged = captor.getValue();
        assertThat(merged.getHeaderTitle()).isEqualTo(seededTitle);
        assertThat(merged.getHeaderIntro()).isEqualTo(introAtT0);
        assertThat(merged.getMainContentQuestion()).isEqualTo(questionAtT5);
        assertThat(merged.getPhotos()).hasSize(1);
    }

    @Test
    void updateWhoAmI_invalidBase64_returns400() {
        when(whoAmIService.getFirst()).thenReturn(null);

        WhoAmIData client = new WhoAmIData();
        client.setPhotos(List.of("NOT_BASE64"));
        UpdateWhoAmIDataRequest req = new UpdateWhoAmIDataRequest(client);

        azar.testinfra.ResourceTestUtil.injectMockRoutingContext(resource, "/api/wai/whoami/admin/update");
        Response r = resource.updateWhoAmI(req);
        assertThat(r.getStatus()).isEqualTo(400);
    }
}

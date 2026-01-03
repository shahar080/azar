package azar.whoami.resources;

import azar.testinfra.BaseUnitTest;
import azar.whoami.dal.service.WhoAmIService;
import azar.whoami.entities.db.WhoAmIData;
import jakarta.ws.rs.core.Response;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WhoAmIResourceUnitTest extends BaseUnitTest {

    @Mock
    WhoAmIService whoAmIService;

    @InjectMocks
    WhoAmIResource resource;

    private void initCtx() {
        azar.testinfra.ResourceTestUtil.injectMockRoutingContext(resource, "/api/wai/whoami");
    }

    @Test
    void getWhoAmI_whenDataExists_returnsOkWithEntity() {
        WhoAmIData data = new WhoAmIData();
        data.setHeaderTitle("Shahar");
        when(whoAmIService.getFirst()).thenReturn(data);

        initCtx();
        Response response = resource.getWhoAmI();

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getEntity()).isInstanceOf(WhoAmIData.class);
        assertThat(((WhoAmIData) response.getEntity()).getHeaderTitle()).isEqualTo("Shahar");
        verify(whoAmIService).getFirst();
    }

    @Test
    void getWhoAmI_whenNoData_returnsDefaultPayload() {
        when(whoAmIService.getFirst()).thenReturn(null);

        initCtx();
        Response response = resource.getWhoAmI();

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getEntity()).isInstanceOf(WhoAmIData.class);
        verify(whoAmIService).getFirst();
    }
}

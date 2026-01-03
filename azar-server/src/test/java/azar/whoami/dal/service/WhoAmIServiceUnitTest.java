package azar.whoami.dal.service;

import azar.testinfra.BaseUnitTest;
import azar.whoami.dal.dao.WhoAmIDao;
import azar.whoami.entities.db.WhoAmIData;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Example unit test for a Service layer using Mockito for isolation.
 * <p>
 * This test runs fast (no Quarkus runtime) and verifies behavior of WhoAmIService
 * by mocking its DAO collaborator. It demonstrates modern assertions (AssertJ)
 * and Mockito STRICT_STUBS enforcement from BaseUnitTest.
 */
class WhoAmIServiceUnitTest extends BaseUnitTest {

    @Mock
    WhoAmIDao whoAmIDao;

    @Mock
    PanacheQuery<WhoAmIData> query;

    @InjectMocks
    WhoAmIService service;

    @Test
    void merge_persists_entity_and_returns_it() {
        var entity = new WhoAmIData();
        entity.setHeaderTitle("Hello");

        // When
        var ret = service.merge(entity);

        // Then
        verify(whoAmIDao).persist(entity);
        assertThat(ret).isSameAs(entity);
    }

    @Test
    void getFirst_returns_first_result_from_query() {
        var first = new WhoAmIData();
        first.setHeaderTitle("First");

        when(whoAmIDao.findAll()).thenReturn(query);
        when(query.firstResult()).thenReturn(first);

        var result = service.getFirst();

        assertThat(result).isNotNull();
        assertThat(result.getHeaderTitle()).isEqualTo("First");
        verify(whoAmIDao).findAll();
        verify(query).firstResult();
    }
}

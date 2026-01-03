package azar.testinfra;

import java.util.ArrayList;
import java.util.List;
import azar.whoami.entities.db.WhoAmIData;
import com.google.gson.reflect.TypeToken;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;

/**
 * Tests for GsonTestUtil to validate basic usage in the test infrastructure.
 * <p>
 * These tests intentionally focus on:
 * - Simple POJO round-trip
 * - Generic collection round-trip using TypeToken
 * - Error handling on invalid JSON
 */
class GsonTestUtilTest extends BaseUnitTest {

    @Test
    void toJson_and_fromJson_roundTrip_simplePojo() {
        WhoAmIData original = TestDataFactory.sampleWhoAmIData();

        String json = GsonTestUtil.toJson(original);
        WhoAmIData parsed = GsonTestUtil.fromJson(json, WhoAmIData.class);

        assertThat(parsed.getHeaderTitle()).isEqualTo(original.getHeaderTitle());
        assertThat(parsed.getMainContentFirstData()).containsExactlyElementsOf(original.getMainContentFirstData());
        assertThat(parsed.getPhotos()).isEqualTo(original.getPhotos());
    }

    @Test
    void fromJson_withTypeToken_roundTrip_listOfPojo() {
        List<WhoAmIData> list = new ArrayList<>();
        list.add(TestDataFactory.sampleWhoAmIData());
        var second = TestDataFactory.sampleWhoAmIData();
        second.setHeaderTitle("Another Title");
        list.add(second);

        String json = GsonTestUtil.toJson(list);

        List<WhoAmIData> parsed = GsonTestUtil.fromJson(json, new TypeToken<List<WhoAmIData>>() {
        });

        assertThat(parsed).hasSize(2);
        assertThat(parsed.get(0).getHeaderTitle()).isEqualTo(list.get(0).getHeaderTitle());
        assertThat(parsed.get(1).getHeaderTitle()).isEqualTo("Another Title");
    }

    @Test
    void fromJson_invalidJson_throwsRuntimeException() {
        String invalid = "{ this is not: valid json }";
        assertThatThrownBy(() -> GsonTestUtil.fromJson(invalid, WhoAmIData.class))
                .isInstanceOf(RuntimeException.class)
                .hasCauseInstanceOf(com.google.gson.JsonSyntaxException.class);
    }
}

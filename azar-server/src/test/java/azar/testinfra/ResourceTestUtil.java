package azar.testinfra;

import java.lang.reflect.Field;
import azar.shared.resources.BaseResource;
import io.vertx.ext.web.Route;
import io.vertx.ext.web.RoutingContext;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;

/**
 * Utility helpers for testing Resource classes that extend {@link BaseResource} without spinning up HTTP.
 * <p>
 * Why this exists:
 * In resource unit tests we often need a minimal {@link RoutingContext} so code that relies on the
 * current route/path can execute. Instead of starting Vert.x/Quarkus, we inject a Mockito-based mock
 * into the protected {@code routingContext} field on {@link BaseResource} via reflection.
 * <p>
 * Notes and best practices:
 * - Reflection is used only in tests and is acceptable here to keep production code untouched.
 * - We use Mockito lenient stubs to avoid strict stubbing failures when only a subset of methods are used.
 * - Prefer HTTP tests with {@code @QuarkusTest} when you want to validate filters, security, or serialization.
 */
public final class ResourceTestUtil {
    private ResourceTestUtil() {
    }

    /**
     * Injects a mocked RoutingContext into the given resource, configured to return the provided path
     * for both {@code normalizedPath()} and {@code currentRoute().getPath()}.
     * <p>
     * Usage:
     * <pre>
     *   @InjectMocks MyResource resource;
     *   @Test void foo() {
     *     ResourceTestUtil.injectMockRoutingContext(resource, "/api/my/endpoint");
     *     // call resource methods that rely on routingContext
     *   }
     * </pre>
     *
     * @param resource the resource instance under test
     * @param path     the path to expose via the mock routing context
     */
    public static void injectMockRoutingContext(BaseResource resource, String path) {
        try {
            Field f = BaseResource.class.getDeclaredField("routingContext");
            f.setAccessible(true);
            RoutingContext ctx = mock(RoutingContext.class);
            lenient().when(ctx.normalizedPath()).thenReturn(path);
            Route route = mock(Route.class);
            lenient().when(route.getPath()).thenReturn(path);
            lenient().when(ctx.currentRoute()).thenReturn(route);
            f.set(resource, ctx);
        } catch (Exception e) {
            throw new RuntimeException("Failed to inject mock RoutingContext", e);
        }
    }
}

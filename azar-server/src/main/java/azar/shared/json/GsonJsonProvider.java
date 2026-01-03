package azar.shared.json;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.ext.MessageBodyReader;
import jakarta.ws.rs.ext.MessageBodyWriter;
import jakarta.ws.rs.ext.Provider;

/**
 * JAX-RS provider that enables using Gson for JSON serialization/deserialization.
 * <p>
 * This provider is bound to media type "application/gson+json" to avoid interfering with
 * the existing Jackson-based providers bound to "application/json". To use Gson for a specific
 * endpoint or client, set the Content-Type/Accept header to application/gson+json.
 */
@Provider
@ApplicationScoped
@Priority(5000) // lower priority than built-in providers; also distinct media type prevents conflicts
@Produces("application/gson+json")
@Consumes("application/gson+json")
public class GsonJsonProvider implements MessageBodyReader<Object>, MessageBodyWriter<Object> {

    private final Gson gson = new GsonBuilder()
            .disableHtmlEscaping()
            .serializeNulls()
            .create();

    @Override
    public boolean isReadable(Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return mediaType != null && mediaType.toString().equals("application/gson+json");
    }

    @Override
    public Object readFrom(Class<Object> type, Type genericType, Annotation[] annotations, MediaType mediaType,
                           jakarta.ws.rs.core.MultivaluedMap<String, String> httpHeaders, InputStream entityStream)
            throws IOException {
        try (Reader reader = new InputStreamReader(entityStream, StandardCharsets.UTF_8)) {
            Type target = genericType != null ? genericType : type;
            return gson.fromJson(reader, target);
        }
    }

    @Override
    public boolean isWriteable(Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return mediaType != null && mediaType.toString().equals("application/gson+json");
    }

    @Override
    public void writeTo(Object t, Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType,
                        jakarta.ws.rs.core.MultivaluedMap<String, Object> httpHeaders, OutputStream entityStream)
            throws IOException {
        try (Writer writer = new OutputStreamWriter(entityStream, StandardCharsets.UTF_8)) {
            gson.toJson(t, writer);
        }
    }

    @Override
    public long getSize(Object o, Class<?> type, Type genericType, Annotation[] annotations, MediaType mediaType) {
        return -1; // deprecated in JAX-RS 2.0 and ignored by runtime
    }
}

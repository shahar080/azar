package azar.adapters;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.time.Instant;

/**
 * Author: Shahar Azar
 * Date:   18/12/2024
 * Purpose: //TODO add purpose for class InstantTypeAdapter
 **/
public class InstantTypeAdapter extends TypeAdapter<Instant> {

    @Override
    public void write(JsonWriter out, Instant value) throws IOException {
        if (value == null) {
            out.nullValue();
        } else {
            out.value(value.toString()); // Serialize Instant as ISO-8601 string
        }
    }

    @Override
    public Instant read(JsonReader in) throws IOException {
        String timestamp = in.nextString();
        return Instant.parse(timestamp); // Deserialize Instant from ISO-8601 string
    }
}
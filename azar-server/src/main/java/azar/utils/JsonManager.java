package azar.utils;

import com.google.gson.Gson;
import com.google.inject.Inject;

import java.lang.reflect.Type;

/**
 * Author: Shahar Azar
 * Date:   12/12/2024
 **/
public class JsonManager {
    @Inject
    private Gson gson;

    /**
     * A function to convert an object to a json without the type
     *
     * @param object - the given object
     * @param <T>    - A signature to use generics in the function
     * @return the formatted object as json in a String
     */
    public <T> String toJson(T object) {
        return gson.toJson(object);
    }

    /**
     * A function to convert an object to a json
     *
     * @param object - the given object
     * @param type   - the given objects' type
     * @param <T>    - A signature to use generics in the function
     * @return the formatted object as json in a String
     */
    public <T> String toJson(T object, Type type) {
        return gson.toJson(object, type);
    }

    /**
     * A function to de-convert an object from json
     *
     * @param json - the given json
     * @param type - the given objects' type
     * @param <T>  - A signature to use generics in the function
     * @return the object
     */
    public <T> T fromJson(String json, Type type) {
        return gson.fromJson(json, type);
    }
}

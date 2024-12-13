import apiClient from "./apiClient.ts";
import {UserNameAndPassword} from "../../models/models.ts"

export async function login(userNameAndPassword: UserNameAndPassword): Promise<boolean> {
    try {
        // Make a POST request to the server
        console.log(userNameAndPassword)
        const response = await apiClient.post('/user/login', userNameAndPassword);
        console.log('Login successful:', response.data);

        // Return the response data to the caller
        return response.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
        // Optionally rethrow the error to let the caller handle it
        return false;
    }
}
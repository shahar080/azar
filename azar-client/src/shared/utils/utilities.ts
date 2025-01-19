import {setAuthToken, setUserId, setUserName, setUserType} from "./AppState.ts";

export function clearCredentials() {
    setAuthToken('');
    setUserName('');
    setUserType('');
    setUserId('');
}
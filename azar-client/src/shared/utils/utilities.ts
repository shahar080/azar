import {setAuthToken, setUserId, setUserName, setUserType} from "../../cloud/utils/AppState.ts";

export function clearCredentials() {
    setAuthToken('');
    setUserName('');
    setUserType('');
    setUserId('');
}
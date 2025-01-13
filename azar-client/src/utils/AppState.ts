let authToken: string;
let userName: string;
let userType: string;
let userId: string;
let drawerPinned: boolean;

export function setAuthToken(token: string) {
    authToken = token;
}

export function getAuthToken(): string {
    return authToken || '';
}

export function setUserName(name: string) {
    userName = name;
}

export function getUserName(): string {
    return userName || '';
}

export function setUserType(type: string) {
    userType = type;
}

export function getUserType(): string {
    return userType || '';
}

export function setUserId(id: string) {
    userId = id;
}

export function getUserId(): string {
    return userId || '';
}

export function setDrawerPinnedState(pinned: boolean) {
    drawerPinned = pinned;
}

export function getDrawerPinnedState(): boolean {
    return drawerPinned === undefined ? true : drawerPinned;
}

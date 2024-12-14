export interface User {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    userType: string;
}

export interface UserNameAndPassword {
    userName: string;
    password: string;
}
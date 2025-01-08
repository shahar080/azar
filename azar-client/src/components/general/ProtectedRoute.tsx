import React from 'react';
import {Navigate} from 'react-router-dom';
import {getAuthToken} from "../../utils/AppState.ts";

const ProtectedRoute = ({children}: { children: React.ReactElement }) => {
    const token = getAuthToken();
    return token ? children : <Navigate to="/login"/>;
};

export default ProtectedRoute;

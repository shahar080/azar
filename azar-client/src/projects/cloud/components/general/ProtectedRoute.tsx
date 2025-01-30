import React from 'react';
import {Navigate} from 'react-router-dom';
import {getAuthToken} from "../../../shared/utils/AppState.ts";

const ProtectedRoute = ({children, redirectPath}: { children: React.ReactElement, redirectPath: string }) => {
    const token = getAuthToken();
    return token ? children : <Navigate to={redirectPath}/>;
};

export default ProtectedRoute;

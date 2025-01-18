import React from 'react';
import {Navigate} from 'react-router-dom';
import {getAuthToken} from "../../utils/AppState.ts";
import {LOGIN_ROUTE} from "../../../shared/utils/reactRoutes.ts";

const ProtectedRoute = ({children}: { children: React.ReactElement }) => {
    const token = getAuthToken();
    return token ? children : <Navigate to={LOGIN_ROUTE}/>;
};

export default ProtectedRoute;

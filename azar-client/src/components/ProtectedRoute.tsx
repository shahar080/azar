import React from 'react';
import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({children}: { children: React.ReactElement }) => {
    const token = localStorage.getItem('authToken');
    return token ? children : <Navigate to="/login"/>;
};

export default ProtectedRoute;

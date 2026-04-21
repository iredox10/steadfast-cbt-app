import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import ForcePasswordChange from './ForcePasswordChange';

/**
 * A wrapper component for protected routes that redirects to the login page
 * if the user is not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        // Redirect them to the /admin-login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    return (
        <>
            <ForcePasswordChange />
            {children}
        </>
    );
};

export default ProtectedRoute;

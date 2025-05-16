// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts-page/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { currentUser, isAdmin } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateRoute;
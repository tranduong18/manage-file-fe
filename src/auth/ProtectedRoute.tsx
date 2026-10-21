import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated, ready } = useAuth();

    if (!ready) {
        return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
    }
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
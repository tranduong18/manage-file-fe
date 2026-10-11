import { Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function AppLayout() {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <span className="font-semibold text-lg">📂 Drive File Manager</span>
                    <button onClick={logout} className="text-sm px-3 py-1 border rounded hover:bg-gray-100">
                        Đăng xuất
                    </button>
                </div>
            </header>
            <main className="max-w-6xl mx-auto p-4">
                <Outlet />
            </main>
        </div>
    );
}
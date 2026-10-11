import { useAuth } from '../auth/AuthContext';

export default function HomePage() {
    const { logout } = useAuth();
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-xl font-semibold">Đăng nhập thành công 🎉</h1>
            <button onClick={logout} className="px-3 py-1 border rounded">Đăng xuất</button>
        </div>
    );
}
import { useSearchParams } from 'react-router-dom';
import { startGoogleLogin } from '../api/auth';

const MESSAGES: Record<string, string> = {
    expired: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
    google: 'Cần cấp lại quyền truy cập Google Drive, vui lòng đăng nhập lại.',
};

export default function LoginPage() {
    const [params] = useSearchParams();
    const reason = params.get('reason');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow w-96 text-center space-y-4">
                <h1 className="text-2xl font-semibold">Drive File Manager</h1>
                {reason && MESSAGES[reason] && (
                    <p className="text-sm text-amber-600">{MESSAGES[reason]}</p>
                )}
                <button
                    onClick={startGoogleLogin}
                    className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                    Đăng nhập với Google
                </button>
            </div>
        </div>
    );
}
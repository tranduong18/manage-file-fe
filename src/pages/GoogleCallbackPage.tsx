import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginWithCode, STATE_KEY } from '../api/auth';
import { getApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function GoogleCallbackPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const started = useRef(false); // chặn StrictMode chạy 2 lần (code chỉ dùng được 1 lần)

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        const code = params.get('code');
        const state = params.get('state');
        const googleError = params.get('error');

        if (googleError) return setError(`Google từ chối: ${googleError}`);
        if (!code) return setError('Thiếu mã đăng nhập từ Google.');
        if (state !== sessionStorage.getItem(STATE_KEY))
            return setError('State không khớp, có thể là yêu cầu giả mạo.');
        sessionStorage.removeItem(STATE_KEY);

        loginWithCode(code)
            .then((res) => {
                setToken(res.accessToken);
                navigate('/', { replace: true });
            })
            .catch((e) => setError(getApiError(e).message));
    }, []);

    if (error)
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-red-600">{error}</p>
                <a href="/login" className="text-blue-600 underline">Quay lại đăng nhập</a>
            </div>
        );
    return <div className="p-8 text-center">Đang đăng nhập...</div>;
}
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ErrorResponse } from '../types/api';
import { messageForCode } from '../utils/errors';

export const TOKEN_KEY = 'jwt';
const baseURL = import.meta.env.VITE_API_BASE_URL;

// withCredentials: để trình duyệt gửi/nhận cookie refresh_token
export const api = axios.create({ baseURL, withCredentials: true });

// Instance trần (không interceptor) cho request refresh, tránh lặp vô hạn
const bare = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Nhiều request cùng 401 thì chỉ gọi refresh 1 lần, dùng chung 1 promise
let refreshing: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
    if (!refreshing) {
        refreshing = bare
            .post('/api/auth/refresh')
            .then((res) => {
                const token: string = res.data.data?.accessToken ?? res.data.accessToken;
                localStorage.setItem(TOKEN_KEY, token);
                return token;
            })
            .finally(() => {
                refreshing = null;
            });
    }
    return refreshing;
}

// Lỗi download (responseType: 'blob') trả JSON bên trong Blob -> đọc ra
async function readErrorBody(err: AxiosError): Promise<ErrorResponse | undefined> {
    const data = err.response?.data;
    if (data instanceof Blob) {
        try { return JSON.parse(await data.text()); } catch { return undefined; }
    }
    return data as ErrorResponse | undefined;
}

function redirectToLogin(reason: 'expired' | 'google') {
    localStorage.removeItem(TOKEN_KEY);
    if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?reason=${reason}`;
    }
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
        const body = await readErrorBody(err);
        (err as AxiosError & { apiError?: ErrorResponse }).apiError = body;

        const original = err.config as RetryConfig | undefined;
        const errorCode = body?.error;
        // Không xử lý khi chính API login/refresh/logout bị 401
        const isAuthCall = original?.url?.includes('/api/auth/');

        if (err.response?.status === 401 && original && !isAuthCall) {
            // Mất quyền Google: refresh JWT không giúp được, phải login lại
            if (errorCode === 'GOOGLE_REAUTH_REQUIRED') {
                redirectToLogin('google');
                return Promise.reject(err);
            }

            if (!original._retry) {
                original._retry = true;
                try {
                    const token = await refreshAccessToken();
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                } catch {
                    // refresh thất bại: rơi xuống redirect bên dưới
                }
            }
            redirectToLogin('expired');
        }

        return Promise.reject(err);
    }
);

export function getApiError(err: unknown): { code?: string; message: string } {
    const e = err as AxiosError & { apiError?: ErrorResponse };
    const code = e.apiError?.error;

    if (axios.isAxiosError(err)) {
        if (!err.response) {
            return { code, message: 'Không kết nối được máy chủ. Kiểm tra mạng hoặc backend.' };
        }
        if (err.response.status === 413) {
            return { code, message: 'File quá lớn so với giới hạn của máy chủ.' };
        }
    }

    return {
        code,
        message: messageForCode(code) ?? e.apiError?.message ?? e.message ?? 'Đã có lỗi xảy ra',
    };
}
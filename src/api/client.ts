import axios, { AxiosError } from 'axios';
import type { ErrorResponse } from '../types/api';
import { messageForCode } from '../utils/errors';

export const TOKEN_KEY = 'jwt';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Lỗi download (responseType: 'blob') trả JSON bên trong Blob -> đọc ra
async function readErrorBody(err: AxiosError): Promise<ErrorResponse | undefined> {
    const data = err.response?.data;
    if (data instanceof Blob) {
        try { return JSON.parse(await data.text()); } catch { return undefined; }
    }
    return data as ErrorResponse | undefined;
}

api.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
        const body = await readErrorBody(err);
        const errorCode = body?.error;

        // Không redirect khi chính API login bị 401, để trang callback hiện đúng lỗi
        const isAuthCall = err.config?.url?.includes('/api/auth/');

        if (err.response?.status === 401 && !isAuthCall) {
            localStorage.removeItem(TOKEN_KEY);
            const reason = errorCode === 'GOOGLE_REAUTH_REQUIRED' ? 'google' : 'expired';
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = `/login?reason=${reason}`;
            }
        }

        (err as AxiosError & { apiError?: ErrorResponse }).apiError = body;
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
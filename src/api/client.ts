import axios, {AxiosError} from 'axios';
import type { ErrorResponse } from "../types/api.ts";

export const TOKEN_KEY = 'jwt';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

api.interceptors.request.use((config) => {
   const token = localStorage.getItem(TOKEN_KEY);
   if(token) config.headers.Authorization = `Bearer ${token}`;
   return config;
});

async function readErrorBody(error: AxiosError): Promise<ErrorResponse | undefined> {
    const data = error.response?.data;
    if(data instanceof Blob){
        try {
            return JSON.parse(await data.text());
        } catch {
            return undefined;
        }
    }
}

api.interceptors.response.use((res) => res, async (error: AxiosError) => {
    const body = await readErrorBody(error);
    const errorCode = body?.error;

    if(error.response?.status === 401){
        localStorage.removeItem(TOKEN_KEY);
        const reason = errorCode === 'GOOGLE_REAUTH_REQUIRED' ? 'google' : 'expired';
        if(!window.location.pathname.startsWith('/login')){
            window.location.href = `/login?reason=${reason}`;
        }
    }

    (error as AxiosError & { apiError? : ErrorResponse}).apiError = body;
    return Promise.reject(error);
})

export function getApiError(error: unknown) : { code?: string; message: string}{
    const e = error as AxiosError & { apiError? : ErrorResponse};
    return {
        code: e.apiError?.error,
        message: e.apiError?.message ?? e.message ?? 'Đã có lỗi xảy ra'
    }
}
import { api } from './client';
import type { LoginResponse } from '../types/api';

const SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.file',
].join(' ');

export const STATE_KEY = 'oauth_state';

export function startGoogleLogin() {
    const state = crypto.randomUUID();
    sessionStorage.setItem(STATE_KEY, state);

    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent',
        state,
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function loginWithCode(code: string): Promise<LoginResponse> {
    const res = await api.post('/api/auth/google', {
        code
    });
    return res.data.data ?? res.data;
}

export async function logoutApi(): Promise<void> {
    await api.post('/api/auth/logout');
}
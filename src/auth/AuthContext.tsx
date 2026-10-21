import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { TOKEN_KEY, refreshAccessToken } from '../api/client';
import { logoutApi } from '../api/auth';

interface AuthCtx {
    isAuthenticated: boolean;
    ready: boolean; // đã thử khôi phục phiên xong chưa
    setToken: (t: string) => void;
    logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [ready, setReady] = useState(() => !!localStorage.getItem(TOKEN_KEY));

    // Mở app mà không còn access JWT: thử khôi phục phiên bằng cookie refresh
    useEffect(() => {
        if (token) return;
        let cancelled = false;
        refreshAccessToken()
            .then((t) => !cancelled && setTokenState(t))
            .catch(() => {})
            .finally(() => !cancelled && setReady(true));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setToken = (t: string) => {
        localStorage.setItem(TOKEN_KEY, t);
        setTokenState(t);
        setReady(true);
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch {
            /* lỗi mạng vẫn cho logout phía client */
        }
        localStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
    };

    return (
        <Ctx.Provider value={{ isAuthenticated: !!token, ready, setToken, logout }}>
            {children}
        </Ctx.Provider>
    );
}
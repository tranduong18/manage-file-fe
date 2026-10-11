import { createContext, useContext, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '../api/client';

interface AuthCtx {
    isAuthenticated: boolean;
    setToken: (t: string) => void;
    logout: () => void;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));

    const setToken = (t: string) => {
        localStorage.setItem(TOKEN_KEY, t);
        setTokenState(t);
    };
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setTokenState(null);
    };

    return (
        <Ctx.Provider value={{ isAuthenticated: !!token, setToken, logout }}>
            {children}
        </Ctx.Provider>
    );
}
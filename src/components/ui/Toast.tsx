import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';
interface ToastItem {
    id: number;
    message: string;
    type: ToastType
}

const Ctx = createContext<{ push: (message: string, type?: ToastType) => void }>(null!);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const push = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    }, []);

    return (
        <Ctx.Provider value={{ push }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[60] space-y-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`px-4 py-2 rounded shadow text-sm text-white ${
                            t.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                        }`}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    );
}
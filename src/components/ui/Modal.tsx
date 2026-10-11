import type { ReactNode } from 'react';

interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ open, title, onClose, children }: Props) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold">{title}</h2>
                {children}
            </div>
        </div>
    );
}
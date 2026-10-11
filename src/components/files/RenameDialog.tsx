import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';

interface Props {
    open: boolean;
    currentName: string;
    loading: boolean;
    onSubmit: (newName: string) => void;
    onClose: () => void;
}

export default function RenameDialog({ open, currentName, loading, onSubmit, onClose }: Props) {
    const [name, setName] = useState(currentName);
    useEffect(() => setName(currentName), [currentName, open]);

    const submit = () => {
        const t = name.trim();
        if (t && t !== currentName) onSubmit(t);
    };

    return (
        <Modal open={open} title="Đổi tên file" onClose={onClose}>
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                className="w-full border rounded px-3 py-2"
            />
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-3 py-1.5 border rounded">Huỷ</button>
                <button
                    onClick={submit}
                    disabled={loading || !name.trim() || name.trim() === currentName}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60"
                >
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
            </div>
        </Modal>
    );
}
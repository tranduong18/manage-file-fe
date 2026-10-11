import { useState } from 'react';
import Modal from '../ui/Modal';
import { useCreateFolder } from '../../hooks/useFolders';
import { getApiError } from '../../api/client';

interface Props {
    open: boolean;
    parentGoogleId: string | undefined;
    onClose: () => void;
}

export default function CreateFolderDialog({ open, parentGoogleId, onClose }: Props) {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const mutation = useCreateFolder(parentGoogleId);

    const close = () => {
        setName('');
        setError(null);
        onClose();
    };

    const submit = () => {
        const trimmed = name.trim();
        if (!trimmed) return setError('Tên folder không được để trống.');
        mutation.mutate(trimmed, {
            onSuccess: close,
            onError: (e) => setError(getApiError(e).message),
        });
    };

    return (
        <Modal open={open} title="Tạo folder mới" onClose={close}>
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Tên folder"
                className="w-full border rounded px-3 py-2"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
                <button onClick={close} className="px-3 py-1.5 border rounded">
                    Huỷ
                </button>
                <button
                    onClick={submit}
                    disabled={mutation.isPending}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60"
                >
                    {mutation.isPending ? 'Đang tạo...' : 'Tạo'}
                </button>
            </div>
        </Modal>
    );
}
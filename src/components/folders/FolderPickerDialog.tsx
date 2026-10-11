import { useState } from 'react';
import Modal from '../ui/Modal';
import Breadcrumb, { type Crumb } from './Breadcrumb';
import { useFolders } from '../../hooks/useFolders';

const ROOT: Crumb = { id: null, name: 'Thư mục gốc' };

interface Props {
    open: boolean;
    loading: boolean;
    // folderId = googleFolderId, hoặc 'root' nếu chọn gốc
    onSelect: (folderId: string) => void;
    onClose: () => void;
}

export default function FolderPickerDialog({ open, loading, onSelect, onClose }: Props) {
    const [trail, setTrail] = useState<Crumb[]>([ROOT]);
    const current = trail[trail.length - 1];
    const q = useFolders(current.id ?? undefined);
    const folders = q.data?.pages.flatMap((p) => p.content) ?? [];

    const close = () => {
        setTrail([ROOT]);
        onClose();
    };

    return (
        <Modal open={open} title="Chọn thư mục đích" onClose={close}>
            <Breadcrumb trail={trail} onNavigate={(i) => setTrail((t) => t.slice(0, i + 1))} />

            <div className="border rounded max-h-60 overflow-y-auto divide-y text-sm">
                {q.isLoading && <p className="p-3 text-gray-500">Đang tải...</p>}
                {!q.isLoading && folders.length === 0 && (
                    <p className="p-3 text-gray-500">Không có thư mục con.</p>
                )}
                {folders.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setTrail((t) => [...t, { id: f.googleFolderId, name: f.name }])}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50"
                    >
                        📁 {f.name}
                    </button>
                ))}
                {q.hasNextPage && (
                    <button
                        onClick={() => q.fetchNextPage()}
                        className="w-full px-3 py-2 text-blue-600 hover:bg-gray-50"
                    >
                        Xem thêm
                    </button>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <button onClick={close} className="px-3 py-1.5 border rounded">Huỷ</button>
                <button
                    onClick={() => onSelect(current.id ?? 'root')}
                    disabled={loading}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60"
                >
                    {loading ? 'Đang chuyển...' : `Chuyển vào "${current.name}"`}
                </button>
            </div>
        </Modal>
    );
}
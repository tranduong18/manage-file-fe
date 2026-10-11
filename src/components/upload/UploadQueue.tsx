import type { UploadItem } from '../../hooks/useUpload';
import { formatBytes } from '../../utils/format';

interface Props {
    items: UploadItem[];
    onClear: () => void;
}

export default function UploadQueue({ items, onClear }: Props) {
    if (items.length === 0) return null;
    const busy = items.some((i) => i.status === 'uploading');

    return (
        <div className="fixed bottom-4 left-4 z-40 w-80 bg-white border rounded-lg shadow-lg">
            <div className="flex items-center justify-between px-3 py-2 border-b text-sm font-medium">
                <span>Tải lên ({items.length})</span>
                {!busy && (
                    <button onClick={onClear} className="text-gray-500 hover:text-gray-800">Đóng</button>
                )}
            </div>
            <ul className="max-h-60 overflow-y-auto divide-y">
                {items.map((i) => (
                    <li key={i.id} className="px-3 py-2 text-sm space-y-1">
                        <div className="flex justify-between gap-2">
                            <span className="truncate">{i.file.name}</span>
                            <span className="text-gray-400 shrink-0">{formatBytes(i.file.size)}</span>
                        </div>
                        {i.status === 'error' ? (
                            <p className="text-red-600 text-xs">{i.error}</p>
                        ) : (
                            <>
                                <div className="h-1.5 bg-gray-200 rounded">
                                    <div
                                        className={`h-full rounded ${i.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}
                                        style={{ width: `${i.progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    {i.status === 'done'
                                        ? 'Hoàn tất'
                                        : i.progress >= 100
                                            ? 'Đang đẩy lên Google Drive...'
                                            : `${i.progress}%`}
                                </p>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
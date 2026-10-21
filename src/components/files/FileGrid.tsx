import FileCard from './FileCard';
import type { FileResponse, FolderResponse } from '../../types/api';

interface Props {
    folders: FolderResponse[];
    files: FileResponse[];
    filtering: boolean;
    downloadingId: string | null;
    hasMoreFolders: boolean;
    loadingMoreFolders: boolean;
    onLoadMoreFolders: () => void;
    onOpenFolder: (f: FolderResponse) => void;
    onPreview: (f: FileResponse) => void;
    onDownload: (f: FileResponse) => void;
    onRename: (f: FileResponse) => void;
    onMove: (f: FileResponse) => void;
    onDelete: (f: FileResponse) => void;
}

const gridCls = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';

export default function FileGrid(p: Props) {
    if (!p.folders.length && !p.files.length) {
        return (
            <div className="bg-white border rounded-lg p-10 text-center text-gray-500">
                {p.filtering
                    ? 'Không có file nào khớp với bộ lọc.'
                    : 'Thư mục trống. Kéo thả file vào đây, bấm "Tải lên" hoặc "Chọn từ Drive".'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {p.folders.length > 0 && (
                <div className={gridCls}>
                    {p.folders.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => p.onOpenFolder(f)}
                            className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 hover:bg-gray-50 text-sm text-left"
                        >
                            <span className="text-xl">📁</span>
                            <span className="truncate">{f.name}</span>
                        </button>
                    ))}
                </div>
            )}

            {p.hasMoreFolders && (
                <button
                    onClick={p.onLoadMoreFolders}
                    disabled={p.loadingMoreFolders}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-60"
                >
                    {p.loadingMoreFolders ? 'Đang tải...' : 'Xem thêm folder'}
                </button>
            )}

            <div className={gridCls}>
                {p.files.map((f) => (
                    <FileCard
                        key={f.id}
                        file={f}
                        downloading={p.downloadingId === f.id}
                        onPreview={p.onPreview}
                        onDownload={p.onDownload}
                        onRename={p.onRename}
                        onMove={p.onMove}
                        onDelete={p.onDelete}
                    />
                ))}
            </div>
        </div>
    );
}
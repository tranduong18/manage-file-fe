import type { FileResponse, FolderResponse } from '../../types/api';
import { formatBytes, formatDate } from '../../utils/format';
import { mimeIcon } from '../../utils/mime';

interface Props {
    folders: FolderResponse[];
    files: FileResponse[];
    hasMoreFolders: boolean;
    loadingMoreFolders: boolean;
    downloadingId: string | null;
    onLoadMoreFolders: () => void;
    onOpenFolder: (f: FolderResponse) => void;
    onDownload: (f: FileResponse) => void;
    onRename: (f: FileResponse) => void;
    onMove: (f: FileResponse) => void;
    onDelete: (f: FileResponse) => void;
}

const actionBtn = 'px-2 py-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-40';

export default function FileTable({
                                      folders, files, hasMoreFolders, loadingMoreFolders, downloadingId,
                                      onLoadMoreFolders, onOpenFolder, onDownload, onRename, onMove, onDelete,
                                  }: Props) {
    if (folders.length === 0 && files.length === 0) {
        return (
            <div className="bg-white border rounded-lg p-10 text-center text-gray-500">
                Thư mục trống. Kéo thả file vào đây hoặc bấm "Tải lên".
            </div>
        );
    }

    return (
        <div className="bg-white border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                    <th className="px-4 py-2">Tên</th>
                    <th className="px-4 py-2 w-28">Kích thước</th>
                    <th className="px-4 py-2 w-44">Ngày tải lên</th>
                    <th className="px-4 py-2 w-24">Nguồn</th>
                    <th className="px-4 py-2 w-40 text-right">Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {folders.map((f) => (
                    <tr key={f.id} onDoubleClick={() => onOpenFolder(f)} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                            <button onClick={() => onOpenFolder(f)} className="flex items-center gap-2 font-medium">
                                <span>📁</span>
                                <span className="hover:underline">{f.name}</span>
                            </button>
                        </td>
                        <td className="px-4 py-2 text-gray-400">—</td>
                        <td className="px-4 py-2 text-gray-400">—</td>
                        <td className="px-4 py-2">{f.source === 'PICKED' ? 'Đã chọn' : 'Tạo mới'}</td>
                        <td />
                    </tr>
                ))}

                {hasMoreFolders && (
                    <tr className="border-t">
                        <td colSpan={5} className="px-4 py-2 text-center">
                            <button
                                onClick={onLoadMoreFolders}
                                disabled={loadingMoreFolders}
                                className="text-blue-600 hover:underline disabled:opacity-60"
                            >
                                {loadingMoreFolders ? 'Đang tải...' : 'Xem thêm folder'}
                            </button>
                        </td>
                    </tr>
                )}

                {files.map((f) => (
                    <tr key={f.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                                <span>{mimeIcon(f.mimeType)}</span>
                                {f.webViewLink ? (
                                    <a href={f.webViewLink} target="_blank" rel="noreferrer" className="hover:underline">
                                        {f.fileName}
                                    </a>
                                ) : (
                                    <span>{f.fileName}</span>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-2">{formatBytes(f.sizeBytes)}</td>
                        <td className="px-4 py-2">{formatDate(f.updatedAt)}</td>
                        <td className="px-4 py-2">{f.source === 'PICKED' ? 'Đã chọn' : 'Tải lên'}</td>
                        <td className="px-2 py-2">
                            <div className="flex justify-end">
                                <button
                                    title="Tải xuống"
                                    className={actionBtn}
                                    disabled={downloadingId === f.id}
                                    onClick={() => onDownload(f)}
                                >
                                    {downloadingId === f.id ? '…' : '⬇'}
                                </button>
                                <button title="Đổi tên" className={actionBtn} onClick={() => onRename(f)}>✏️</button>
                                <button title="Di chuyển" className={actionBtn} onClick={() => onMove(f)}>📂</button>
                                <button title="Xoá" className={actionBtn} onClick={() => onDelete(f)}>🗑️</button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
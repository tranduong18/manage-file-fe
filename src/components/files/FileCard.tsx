import { useEffect, useState } from 'react';
import type { FileResponse } from '../../types/api';
import { mimeIcon } from '../../utils/mime';
import { refreshThumbnail } from '../../api/files';

// Thumbnail Drive có dạng ...=s220, đổi sang s400 cho nét hơn
const bigger = (url: string) => url.replace(/=s\d+$/, '=s400');

// Chỉ các loại này Drive mới tạo thumbnail
const canHaveThumb = (mime: string) =>
    /^(image|video)\//.test(mime) || mime === 'application/pdf';

interface Props {
    file: FileResponse;
    downloading: boolean;
    onDownload: (f: FileResponse) => void;
    onRename: (f: FileResponse) => void;
    onMove: (f: FileResponse) => void;
    onDelete: (f: FileResponse) => void;
}

export default function FileCard({ file, downloading, onDownload, onRename, onMove, onDelete }: Props) {
    const [thumb, setThumb] = useState<string | null | undefined>(file.thumbnailLink);
    const [imgFailed, setImgFailed] = useState(false);
    const [tried, setTried] = useState(false);

    const showImg = !!thumb && !imgFailed;

    const open = () => {
        if (file.webViewLink) window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
    };

    const refresh = async () => {
        if (tried) return; // chỉ thử 1 lần, tránh vòng lặp
        setTried(true);
        try {
            const updated = await refreshThumbnail(file.id);
            setThumb(updated.thumbnailLink);
            setImgFailed(false);
        } catch {
            /* giữ icon */
        }
    };

    // Đồng bộ khi props đổi (ví dụ refetch list trả link mới)
    useEffect(() => {
        setThumb(file.thumbnailLink);
        setImgFailed(false);
    }, [file.thumbnailLink]);

    // Chưa có thumbnail và là loại có thể có -> thử lấy từ Drive
    useEffect(() => {
        if (!thumb && canHaveThumb(file.mimeType)) refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const actions = [
        { icon: downloading ? '…' : '⬇', label: 'Tải xuống', fn: onDownload, disabled: downloading },
        { icon: '✏️', label: 'Đổi tên', fn: onRename, disabled: false },
        { icon: '📂', label: 'Di chuyển', fn: onMove, disabled: false },
        { icon: '🗑️', label: 'Xoá', fn: onDelete, disabled: false },
    ];

    return (
        <div className="group relative rounded-lg border bg-white overflow-hidden hover:shadow-md transition">
            <button
                onClick={open}
                disabled={!file.webViewLink}
                className="block w-full aspect-square bg-gray-100 overflow-hidden"
                title={file.fileName}
            >
                {showImg ? (
                    <img
                        src={bigger(thumb!)}
                        alt={file.fileName}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => {
                            setImgFailed(true);
                            refresh(); // link hết hạn -> lấy link mới (chỉ 1 lần)
                        }}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                        {mimeIcon(file.mimeType)}
                    </div>
                )}
            </button>

            <div className="px-2 py-1.5 text-sm truncate" title={file.fileName}>
                {file.fileName}
            </div>

            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
                {actions.map((a) => (
                    <button
                        key={a.label}
                        title={a.label}
                        disabled={a.disabled}
                        onClick={() => a.fn(file)}
                        className="w-7 h-7 rounded bg-white/90 border text-xs hover:bg-white disabled:opacity-40"
                    >
                        {a.icon}
                    </button>
                ))}
            </div>
        </div>
    );
}